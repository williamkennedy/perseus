import _mathJs from "./math.js";
import $ from "jquery";

var _module_ = {
    exports: {}
};

var exports = _module_.exports;
/* globals katex:false, MathJax:false, Exercises:false */

const KhanMath = _mathJs;

function findChildOrAdd(elem, className) {
    const $child = $(elem).find("." + className);
    if ($child.length === 0) {
        return $("<span>").addClass(className).appendTo($(elem));
    } else {
        return $child;
    }
}

function doCallback(elem, callback) {
    let tries = 0;
    (function check() {
        const height = elem.scrollHeight;
        // Heuristic to guess if the font has kicked in
        // so we have box metrics (magic number ick,
        // but this seems to work mostly-consistently)
        if (height > 18 || tries >= 10) {
            callback();
        } else {
            tries++;
            setTimeout(check, 100);
        }
    })();
}

_module_.exports = {
    // Process a node and add math inside of it. This attempts to use KaTeX to
    // format the math, and if that fails it falls back to MathJax.
    //
    // elem: The element which the math should be added to.
    //
    // text: The text that should be formatted inside of the node. If the node
    //       has already had math formatted inside of it before, this doesn't
    //       have to be provided. If this is not provided, and the node hasn't
    //       been formatted before, the text content of the node is used.
    //
    // force: (optional) if the node has been processed before, then it will
    //        not be formatted again, unless this argument is true
    //
    // callback: (optional) a callback to be run after the math has been
    //           processed (note: this might be called synchronously or
    //           asynchronously, depending on whether KaTeX or MathJax is used)
    processMath: function(elem, text, force, callback) {
        const $elem = $(elem);

        // Only process if it hasn't been done before, or it is forced
        if ($elem.attr("data-math-formula") == null || force) {
            const $katexHolder = findChildOrAdd($elem, "katex-holder");
            const $mathjaxHolder = findChildOrAdd($elem, "mathjax-holder");

            // Search for MathJax-y script tags inside of the node. These are
            // used by MathJax to denote the formula to be typeset. Before, we
            // would update the formula by updating the contents of the script
            // tag, which shouldn't happen any more, but we manage them just in
            // case.
            const script = $mathjaxHolder.find("script[type='math/tex']")[0];

            // If text wasn't provided, we look in two places
            if (text == null) {
                if ($elem.attr("data-math-formula")) {
                    // The old typeset formula
                    text = $elem.attr("data-math-formula");
                } else if (script) {
                    // The contents of the <script> tag
                    text = script.text || script.textContent;
                }
            }

            text = text != null ? text + "" : "";

            // Attempt to clean up some of the math
            text = KhanMath.cleanMath(text);

            // Store the formula that we're using
            $elem.attr("data-math-formula", text);

            if (Exercises.useKatex) {
                // Try to process the nodes with KaTeX first
                try {
                    katex.render(text, $katexHolder[0]);
                    // If that worked, and we previously formatted with
                    // mathjax, do some mathjax cleanup
                    if ($elem.attr("data-math-type") === "mathjax") {
                        // Remove the old mathjax stuff
                        const jax = MathJax.Hub.getJaxFor(script);
                        if (jax) {
                            const e = jax.SourceElement();
                            if (
                                e.previousSibling &&
                                e.previousSibling.className
                            ) {
                                jax.Remove();
                            }
                        }
                    }
                    $elem.attr("data-math-type", "katex");
                    // Call the callback
                    if (callback) {
                        doCallback(elem, callback);
                    }
                    return;
                } catch (err) {
                    // IE doesn't do instanceof correctly, so we resort to
                    // manual checking
                    /* jshint -W103 */
                    if (err.__proto__ !== katex.ParseError.prototype) {
                        throw err;
                    }
                    /* jshint +W103 */
                }
            }

            // Otherwise, fallback to MathJax

            // (Note: we don't need to do any katex cleanup here, because
            // KaTeX is smart and cleans itself up)
            $elem.attr("data-math-type", "mathjax");
            // Update the script tag, or add one if necessary
            if (!script) {
                $mathjaxHolder.append(
                    "<script type='math/tex'>" +
                        text.replace(/<\//g, "< /") +
                        "</script>"
                );
            } else {
                if ("text" in script) {
                    // IE8, etc
                    script.text = text;
                } else {
                    script.textContent = text;
                }
            }
            if (typeof MathJax !== "undefined") {
                // Put the process, a debug log, and the callback into the
                // MathJax queue
                MathJax.Hub.Queue([
                    "Reprocess",
                    MathJax.Hub,
                    $mathjaxHolder[0],
                ]);
                MathJax.Hub.Queue(function() {
                    KhanUtil.debugLog(
                        "MathJax done typesetting (" + text + ")"
                    );
                });
                if (callback) {
                    MathJax.Hub.Queue(function() {
                        const cb = MathJax.Callback(function() {});
                        doCallback(elem, function() {
                            callback();
                            cb();
                        });
                        return cb;
                    });
                }
            }
        }
    },

    processAllMath: function(elem, force) {
        const $elem = $(elem);
        $elem.filter("code").add($elem.find("code")).each(function() {
            const $this = $(this);
            let text = $this.attr("data-math-formula");
            if (text == null) {
                text = $this.text();
                $this.empty();
            }
            KhanUtil.processMath(this, text, force);
        });
    },

    // Function to restore a node to a non-math-processed state
    cleanupMath: function(elem) {
        const $elem = $(elem);

        // Only mess with it if it's been processed before
        if ($elem.attr("data-math-formula")) {
            // Remove MathJax remnants
            if (typeof MathJax !== "undefined") {
                const jax = MathJax.Hub.getJaxFor($elem.find("script")[0]);
                if (jax) {
                    const e = jax.SourceElement();
                    if (e.previousSibling && e.previousSibling.className) {
                        jax.Remove();
                    }
                }
            }

            $elem.text($elem.attr("data-math-formula"));
            $elem.attr("data-math-formula", null);
            $elem.attr("data-math-type", null);
        }

        return elem;
    },

    // Function to retrieve the formula of a typeset math node
    retrieveMathFormula: function(elem) {
        return $(elem).attr("data-math-formula");
    },
};
export default _module_.exports;
