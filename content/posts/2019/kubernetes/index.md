+++
title="Maybe You Don't Need Kubernetes"
date=2019-02-18
path="2019/kubernetes-nomad"
+++

{{ figure(src="./scooter.svg", caption="A woman riding a scooter",  credits="Car vector created by [freepik](https://www.freepik.com/free-photos-vectors/car)") }}

Kubernetes is the 800-pound gorilla of container orchestration.  
It powers some of the biggest microservice deployments worldwide, but it comes
with a price tag.

Especially for smaller teams, it can be time-consuming to maintain and has a
steep learning curve. For what our team of four wanted to achieve at trivago, it
added too much overhead. So we looked into alternatives ...and fell in love with
[Nomad].

## The wishlist

Our team runs a number of typical services for monitoring and performance
analysis: API endpoints for metrics written in Go, Prometheus exporters, log
parsers like Logstash or [Gollum], and databases like InfluxDB or Elasticsearch.
Each of these services run in their own container. We needed a simple system to
keep those jobs running.
 
We started with a list of requirements for container orchestration:

* Run a fleet of services across many machines.
* Provide an overview of running services.
* Allow for communication between services.
* Restart them automatically when they die.
* Be manageable by a small team.

On top of that, the following things were nice to have but not strictly
required:

* Tag machines by their capabilities (e.g. label machines with fast disks for
  I/O heavy services.)
* Be able to run these services independently of any orchestrator (e.g. in
  development).
* Have a common place to share configurations and secrets.
* Provide an endpoint for metrics and logging.

## Why Kubernetes was not a good fit for us

When creating a prototype with Kubernetes, we noticed that we started adding
ever-more complex layers of logic to operate our services. Logic on which we
implicitly relied on.

As an example, Kubernetes allows embedding service configuration inside
[ConfigMaps]. While this is convenient, the service configuration is now tightly
coupled with the orchestrator. Especially when merging multiple config files or
adding more services to a pod, this can lead to increased complexity. Kubernetes
- or [helm] for that matter - allows injecting external configs dynamically to
  ensure separation of concerns. But we found that injecting config files can
  lead to tight, implicit coupling between two distinct locations in a project.
  Moving config files also required adjustments in Kubernetes which should
  ideally, be independent.

Rather than trying to design services that run as infrastructure, we were just
deploying the infrastructure directly. It felt like working against
service-oriented architecture. Not long until the simple task of configuring our
infrastructure took a big share of our time estimates of projects.

For example, in Kubernetes the project structure for our Logstash deployment
looked like this:

```
.
├── docker
│   └── logstash
│       ├── Dockerfile
│       ├── Makefile
│       └── logstash.conf
└── kubernetes
    ├── charts
    │   └── logstash
    │       ├── Chart.yaml
    │       ├── Makefile
    │       ├── templates
    │       │   ├── config.yaml
    │       │   └── deployment.yaml
    │       └── values.yaml
    └── deployments
        ├── datacenter1
        ├── datacenter2
        └── datacenter3
```


You can see that the Logstash configuration (`logstash.conf`) was referenced as
a ConfigMap in `kubernetes/charts/logstsash/templates/config.yaml`. That meant,
there was tight coupling between a service's definition and its deployment.

In Nomad, it’s a flat hierarchy:

```
logstash
├── Dockerfile
├── Makefile
├── logstash.conf
└── nomad.job
```

All the deployment logic is right next to the service itself. The job file can
be templated to allow deploying to multiple datacenters/environments.

Both approaches have their pros and cons. However, the added complexity
introduced by Kubernetes was unnecessary for our small-scale services, which
mostly consist of a few single, stateless containers. On top of that, the
Kubernetes ecosystem is still rapidly evolving. It takes a fair amount of time
and energy to stay up-to-date with the best practices and latest tooling.
Kubectl, minikube, kubeadm, helm, tiller, kops, oc - the list goes on and on.

## When to use Kubernetes

At trivago specifically, many teams use Kubernetes and are quite happy with it.
We have people with tons of operations knowledge around here to tame the beast.

Kubernetes comes with [amazing
features](https://jvns.ca/blog/2017/08/05/how-kubernetes-certificates-work/),
that make container orchestration at scale more manageable:

* Fine-grained [authorization]
* [Custom controllers] allow getting logic into the cluster. These are just
  programs that talk to the Kubernetes API
* [Autoscaling]! Kubernetes can scale your services up and down on demand. It
  uses service metrics to do this without manual intervention.

The question is if you really need all those features. You can't rely on these
abstractions to just work; [you'll have to learn what's going on under the
hood](https://jvns.ca/blog/2017/08/05/how-kubernetes-certificates-work/).

Especially in our team, which runs most services on-premise (because of its
close connection to trivago's core infrastructure), we didn't want to afford
running our own Kubernetes cluster. We wanted to ship services instead.

## With Nomad, deployments are boring

We looked for a simpler alternative and gave Nomad a spin. By now, it has become
the reliable backbone of our infrastructure and covers all points on our
wishlist.

The central part of our infrastructure are *services*, not machines.
Consequently, every service simply has a separate folder in our monorepo (see structure above).

Deployments always happen with a `make deploy` from either the local machine or
triggered via Jenkins on every push. This way, we can manage dozens of services
in our team.

## Batteries not included

Nomad is the 80%. All it does is manage deployments. It takes care of your
rollouts and restarts your containers in case of errors; and that's about it.

If you want anything more, you have to bring it yourself.

The entire point of Nomad is, that it does *less*: there is no [Control Plane],
no [DaemonSet], no [network policy]. Those components are provided by
third-parties - or not at all.

Nomad is *just* an orchestrator. By that, it follows the Unix philosophy: one
tool to do a single job and do it well.

The best part about Nomad is, that it's easy to *replace*. There is little to no
vendor lock-in because the functionality it provides can easily be integrated
into any other system that manages services. It just runs as a plain old single
binary on every machine in your cluster, that's it!

## The Nomad ecosystem of loosely coupled components

The real power of Nomad lies within its ecosystem. It integrates very well with
other - completely optional - products like [Consul] (a key-value store) or
[Vault] (for secrets handling). Inside your Nomad file, you can have sections
for fetching data from those services:

```bash
template {
  data = <<EOH
LOG_LEVEL="{{key "service/geo-api/log-verbosity"}}"
API_KEY="{{with secret "secret/geo-api-key"}}{{.Data.value}}{{end}}"
EOH

  destination = "secrets/file.env"
  env         = true
}
```

This will read the `service/geo-api/log-verbosity` key from Consul and expose it
as a `LOG_LEVEL` environment variable inside your job. It's also exposing
`secret/geo-api-key` from Vault as `API_KEY`. Simple, but powerful!

Because it's so simple, Nomad can also be easily extended with other services
through its API. For example, jobs can be tagged for service discovery. At
trivago, we tag all services, which expose metrics, with `trv-metrics`. This
way, Prometheus finds the services via Consul and periodically scrapes the
`/metrics` endpoint for new data. Same can be done for logs by integrating
[Loki] for example.

There are many other examples for extensibility:

* Trigger a Jenkins job using a webhook and Consul watches to redeploy your
  Nomad job on service config changes.
* Use Ceph to add a distributed filesystem to Nomad.

All of this allowed us to grow our infrastructure organically without too much
up-front commitment.

## Fair warning

No system is perfect. I advise you not to use any fancy new features in
production right now. There are [bugs] and [missing features] of course - but
[that's also the case for
Kubernetes](https://github.com/kubernetes/kubernetes/issues?q=is%3Aopen+is%3Aissue+label%3Akind%2Fbug).

Compared to Kubernetes, there is far less momentum behind Nomad. Kubernetes has
seen around 75000 commits and 2000 contributors so far, while Nomad sports about
14000 commits and 300 contributors. That said, the scope is also much smaller
and the code quality is high.

## Summary

The takeaway is, don't use Kubernetes just because everybody else does.
Carefully evaluate your requirements and check which tool fits for what you're
trying to achieve.

If you're planning to deploy a fleet of homogenous services on a large-scale
infrastructure, Kubernetes might be the way to go. Just be aware of the
additional complexity and the maintenance costs. Some of these costs can be
avoided by using a managed Kubernetes environment like [Google Kubernetes
Engine] or [Amazon EKS].

If you're just looking for a reliable orchestrator that is easy to maintain and
extendable, why not give Nomad a try?

If Kubernetes is a car, Nomad is a scooter.  

Just because both can get you from A to B, depending on where you want to go,
one is more convenient than the other. Both have their right to exist.

## Credits

Thanks to [Jakub Sacha], [Wolfgang Gassler], [Patrick Pokatilo], and [Perry
Manuk] for reviewing drafts of this article.

[Amazon EKS]: https://aws.amazon.com/eks/
[authorization]: https://kubernetes.io/docs/reference/access-authn-authz/authorization/
[Autoscaling]: https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/
[bugs]: https://github.com/hashicorp/nomad/issues?q=is%3Aopen+is%3Aissue+label%3Abug
[ConfigMaps]: https://kubernetes.io/docs/tasks/configure-pod-container/configure-pod-configmap/
[Consul]: https://www.consul.io/
[Control Plane]: https://kubernetes.io/docs/concepts/#kubernetes-control-plane
[Custom controllers]: https://kubernetes.io/docs/concepts/extend-kubernetes/api-extension/custom-resources/#custom-controllers
[DaemonSet]: https://kubernetes.io/docs/concepts/workloads/controllers/daemonset/
[filebeat]: https://github.com/elastic/beats/tree/master/filebeat
[Gollum]: https://github.com/trivago/gollum
[Google Kubernetes Engine]: https://cloud.google.com/kubernetes-engine/
[helm]: https://helm.sh/
[Jakub Sacha]: http://jakubsacha.pl/
[Loki]: https://grafana.com/loki
[missing features]: https://github.com/hashicorp/nomad/issues/698
[network policy]: https://kubernetes.io/docs/concepts/services-networking/network-policies/
[Nomad]: https://www.nomadproject.io/
[Patrick Pokatilo]: https://github.com/SHyx0rmZ
[Perry Manuk]: https://github.com/perrymanuk
[Vault]: https://www.vaultproject.io/
[Wolfgang Gassler]: https://twitter.com/schafele


