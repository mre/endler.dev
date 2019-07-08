async function lazyLoad() {
    await init('/tinysearch_engine_bg.wasm');
}

var loaded = false;

function autocomplete(inp) {
    var currentFocus;

    inp.addEventListener("click", function (e) {
        // There's probably a better way to do lazy loading.
        // Then again, I'm not a JavaScript developer ¯\_(ツ)_/¯
        if (!loaded) {
            lazyLoad();
            loaded = true;
        }
    });

    inp.addEventListener("input", function (e) {
        var a, b, i, val = this.value;

        /*close any already open lists of autocompleted values*/
        closeAllLists();
        if (!val) {
            return false;
        }
        currentFocus = -1;

        /* Create a DIV element that will contain the items (values):*/
        a = document.createElement("DIV");
        a.setAttribute("id", this.id + "autocomplete-list");
        a.setAttribute("class", "autocomplete-items");

        /* Append the DIV element as a child of the autocomplete container:*/
        this.parentNode.appendChild(a);

        let arr = search(val, 3);

        for (i = 0; i < arr.length; i++) {
            let elem = arr[i];

            b = document.createElement("DIV");
            b.innerHTML = elem[0];

            b.addEventListener("click", function (e) {
                window.location.href = `${elem[1]}?q=${encodeURIComponent(val)}`;
            });
            a.appendChild(b);
        }
    });

    inp.addEventListener("keydown", function (e) {
        var x = document.getElementById(this.id + "autocomplete-list");
        if (x) x = x.getElementsByTagName("div");
        if (e.keyCode == 40) {
            /* If the arrow DOWN key is pressed,
            increase the currentFocus variable:*/
            currentFocus++;
            /* and and make the current item more visible:*/
            addActive(x);
        } else if (e.keyCode == 38) { //up
            /* If the arrow UP key is pressed,
            decrease the currentFocus variable:*/
            currentFocus--;
            /* and and make the current item more visible:*/
            addActive(x);
        } else if (e.keyCode == 13) {
            /* If the ENTER key is pressed, prevent the form from being submitted,*/
            e.preventDefault();
            if (currentFocus > -1) {
                /* and simulate a click on the "active" item:*/
                if (x) x[currentFocus].click();
            }
        }
    });

    function addActive(x) {
        /* A function to classify an item as "active":*/
        if (!x) return false;
        /* Start by removing the "active" class on all items:*/
        removeActive(x);
        if (currentFocus >= x.length) currentFocus = 0;
        if (currentFocus < 0) currentFocus = (x.length - 1);
        /* Add class "autocomplete-active":*/
        x[currentFocus].classList.add("autocomplete-active");
    }

    function removeActive(x) {
        /* A function to remove the "active" class from all autocomplete items:*/
        for (var i = 0; i < x.length; i++) {
            x[i].classList.remove("autocomplete-active");
        }
    }

    function closeAllLists(elmnt) {
        /* Close all autocomplete lists in the document,
        except the one passed as an argument:*/
        var x = document.getElementsByClassName("autocomplete-items");
        for (var i = 0; i < x.length; i++) {
            if (elmnt != x[i] && elmnt != inp) {
                x[i].parentNode.removeChild(x[i]);
            }
        }
    }
    document.addEventListener("click", function (e) {
        closeAllLists(e.target);
    });
}
autocomplete(document.getElementById("tinysearch"));