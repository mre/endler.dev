+++
title="Maybe You Don't Need Kubernetes"
date=2019-03-21

[extra]
excerpt="Kubernetes is the 800-pound gorilla of container orchestration.  It powers some of the biggest deployments worldwide, but it comes with a price tag..."
social_img="scooter.png"
comments = [
  {name = "Hacker News", url = "https://news.ycombinator.com/item?id=19467067"},
  {name = "Reddit", url = "https://www.reddit.com/r/kubernetes/comments/b476va/maybe_you_dont_need_kubernetes/"}, 
]
translations = [
  {name = "Japanese", url = "https://yakst.com/ja/posts/5455"},
  {name = "Russian", url = "https://habr.com/ru/post/445030/"},
]
+++

{{ figure(src="./scooter.svg", caption="A woman riding a scooter",  credits="Illustration created by [freepik](https://www.freepik.com/free-photos-vectors/car), Nomad logo by [HashiCorp](https://www.nomadproject.io/).") }}

Kubernetes is the 800-pound gorilla of container orchestration.  
It powers some of the biggest deployments worldwide, but it comes
with a price tag.

Especially for smaller teams, it can be time-consuming to maintain and has a
steep learning curve. For what our team of four wanted to achieve at trivago, it
added too much overhead. So we looked into alternatives &mdash; and fell in love with
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

* Tag machines by their capabilities (e.g., label machines with fast disks for
  I/O heavy services.)
* Be able to run these services independently of any orchestrator (e.g. in
  development).
* Have a common place to share configurations and secrets.
* Provide an endpoint for metrics and logging.

## Why Kubernetes was not a good fit for us

When creating a prototype with Kubernetes, we noticed that we started adding
ever-more complex layers of logic to operate our services. Logic on which we
implicitly relied on.

As an example, Kubernetes allows embedding service configurations using
[ConfigMaps]. Especially when merging multiple config files or
adding more services to a pod, this can get quite confusing quickly.
Kubernetes - or [helm], for that matter - allows injecting external configs
dynamically to ensure separation of concerns. But this can
lead to tight, implicit coupling between your project and Kubernetes.
Helm and ConfigMaps are optional features so you don’t have to use them. You
might as well just copy the config into the Docker image. However, it’s tempting
to go down that path and build unnecessary abstractions that can later bite you.

On top of that, the Kubernetes ecosystem is still rapidly evolving. It takes a
fair amount of time and energy to stay up-to-date with the best practices and
latest tooling. Kubectl, minikube, kubeadm, helm, tiller, kops, oc - the list
goes on and on. Not all tools are necessary to get started with Kubernetes, but
it’s hard to know which ones are, so you have to be at least aware of them.
Because of that, the learning curve is quite steep.

## When to use Kubernetes

At trivago specifically, many teams use Kubernetes and are quite happy with it.
These instances are managed by Google or Amazon however, which have the capacity to do so.

Kubernetes comes with [amazing
features](https://jvns.ca/blog/2017/08/05/how-kubernetes-certificates-work/),
that make container orchestration at scale more manageable:

* Fine-grained [rights management]
* [Custom controllers] allow getting logic into the cluster. These are just
  programs that talk to the Kubernetes API.
* [Autoscaling]! Kubernetes can scale your services up and down on demand. It
  uses service metrics to do this without manual intervention.

The question is if you really need all those features. You can't rely on these
abstractions to just work; [you'll have to learn what's going on under the
hood](https://jvns.ca/blog/2017/08/05/how-kubernetes-certificates-work/).

Especially in our team, which runs most services on-premise (because of its
close connection to trivago's core infrastructure), we didn't want to afford
running our own Kubernetes cluster. We wanted to ship services instead.

{{ figure(src="./nuclear-kubernetes.jpg", link="https://twitter.com/QuinnyPig/status/1093261169614356490") }}

## Batteries not included

Nomad is the 20% of service orchestration that gets you 80% of the way. All it
does is manage deployments. It takes care of your rollouts and restarts your
containers in case of errors, and that's about it.

The entire point of Nomad is that it does *less*: it doesn’t include
fine-grained rights management or [advanced network policies], and that’s by
design. Those components are provided as enterprise services, by a third-party,
or not at all.

I think Nomad hit a sweet-spot between ease of use and expressiveness. It's good
for small, mostly independent services. If you need more control, you'll have to
build it yourself or use a different approach. Nomad is *just* an orchestrator.

The best part about Nomad is that it's easy to *replace*. There is little to no
vendor lock-in because the functionality it provides can easily be integrated
into any other system that manages services. It just runs as a plain old single
binary on every machine in your cluster; that's it!

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
`/metrics` endpoint for new data. The same can be done for logs by integrating
[Loki] for example.

There are many other examples for extensibility:

* Trigger a Jenkins job using a webhook and Consul watches to redeploy your
  Nomad job on service config changes.
* Use Ceph to add a distributed file system to Nomad.
* Use [fabio] for load balancing.

All of this allowed us to [grow our infrastructure organically](https://tech.trivago.com/2019/01/25/nomad-our-experiences-and-best-practices/) without too much
up-front commitment.

## Fair warning

No system is perfect. I advise you not to use any fancy new features in
production right now. There are [bugs] and [missing features] of course - but
[that's also the case for
Kubernetes](https://github.com/kubernetes/kubernetes/issues?q=is%3Aopen+is%3Aissue+label%3Akind%2Fbug).

Compared to Kubernetes, there is far less momentum behind Nomad. Kubernetes has
seen around 75.000 commits and 2000 contributors so far, while Nomad sports about
14.000 commits and 300 contributors. It will be hard for Nomad to keep up with
the velocity of Kubernetes, but maybe it doesn’t have to! The scope is much more
narrow and the smaller community could also mean that it'll be easier to get your 
pull request accepted, in comparison to Kubernetes.

## Summary

The takeaway is: don't use Kubernetes just because everybody else does.
Carefully evaluate your requirements and check which tool fits the bill.

If you're planning to deploy a fleet of homogenous services on large-scale
infrastructure, Kubernetes might be the way to go. Just be aware of the
additional complexity and operational costs. Some of these costs can be
avoided by using a managed Kubernetes environment like [Google Kubernetes
Engine] or [Amazon EKS].

If you're just looking for a reliable orchestrator that is easy to maintain and
extendable, why not give Nomad a try? You might be surprised by how far it'll get you.

If Kubernetes were a car, Nomad would be a scooter. Sometimes you prefer one and
sometimes the other. Both have their right to exist.

## Credits

Thanks to my awesome colleagues [Esteban Barrios], [Jorge-Luis Betancourt], [Simon Brüggen], [Arne Claus], [Inga Feick], [Wolfgang Gassler], [Barnabas Kutassy], [Perry Manuk], [Patrick Pokatilo], and [Jakub Sacha] for reviewing drafts of this article.


[advanced network policies]: https://kubernetes.io/docs/concepts/services-networking/network-policies/
[Amazon EKS]: https://aws.amazon.com/eks/
[Autoscaling]: https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/
[bugs]: https://github.com/hashicorp/nomad/issues?q=is%3Aopen+is%3Aissue+label%3Abug
[ConfigMaps]: https://kubernetes.io/docs/tasks/configure-pod-container/configure-pod-configmap/
[Consul]: https://www.consul.io/
[Control Plane]: https://kubernetes.io/docs/concepts/#kubernetes-control-plane
[Custom controllers]: https://kubernetes.io/docs/concepts/extend-kubernetes/api-extension/custom-resources/#custom-controllers
[DaemonSet]: https://kubernetes.io/docs/concepts/workloads/controllers/daemonset/
[fabio]: https://github.com/fabiolb/fabio
[filebeat]: https://github.com/elastic/beats/tree/master/filebeat
[Gollum]: https://github.com/trivago/gollum
[Google Kubernetes Engine]: https://cloud.google.com/kubernetes-engine/
[helm]: https://helm.sh/
[Loki]: https://grafana.com/loki
[missing features]: https://github.com/hashicorp/nomad/issues/698
[Nomad]: https://www.nomadproject.io/
[rights management]: https://kubernetes.io/docs/reference/access-authn-authz/authorization/
[service tags]: https://www.nomadproject.io/docs/job-specification/service.html#tags
[Vault]: https://www.vaultproject.io/

[Arne Claus]: https://twitter.com/arnecls
[Barnabas Kutassy]: https://twitter.com/kassybas
[Esteban Barrios]: https://www.linkedin.com/in/esteban-barrios-a60a4717
[Inga Feick]: https://github.com/IngaFeick
[Jakub Sacha]: http://jakubsacha.pl/
[Patrick Pokatilo]: https://github.com/SHyx0rmZ
[Perry Manuk]: https://github.com/perrymanuk
[Simon Brüggen]: https://github.com/m3t0r
[Wolfgang Gassler]: https://twitter.com/schafele
[Jorge-Luis Betancourt]: http://jorgelbg.github.io/