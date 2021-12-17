import StubTagEditor from "./components/stub-tag-editor.jsx";
import * as React from "react";

/* eslint-disable brace-style */
/* TODO(csilvers): fix these lint errors (http://eslint.org/docs/rules): */
/* To fix, remove an entry above, run ka-lint, and fix errors. */

/**
 * [Most of] the Perseus client API.
 *
 * If making a change to this file, or otherwise to the perseus
 * API, you should increment:
 *  * the perseus api major version if it is a breaking change
 *  * the perseus api minor version if it is an additive-only change
 *  * nothing if it is purely a bug fix.
 *
 * Callbacks passed to Renderer/ItemRenderer:
 *  * onInputError:
 *    Called when there is an error grading a widget
 *  * onFocusChange: (newFocusPath, oldFocusPath, keypadDOMNode)
 *    Called when the user focus changes. The first two parameters are `path`
 *    arrays uniquely identifying the respect inputs. The third parameter,
 *    `keypadDOMNode`, is the DOM node of the custom keypad, or `null` if the
 *    keypad is disabled, which can be used by clients to accommodate for the
 *    appearance of the keypad on the screen.
 *    When focus changes to or from nothing being selected, `path` will be null.
 *  * interactionCallback: Called when the user interacts with a widget.
 *  * answerableCallback: Called with the current `answerability` of the
 *    problem, e.g. whether all required fields have input.
 *  * getAnotherHint: If provided, a button is rendered at the bottom of the
 *    hints (only when at least one hint has been shown, and not all hints
 *    have been shown) allowing the user to take another hint. This function
 *    is then called when the user clicks the button.
 *
 * Stable CSS ClassNames:
 * These are css class names that will continue to preserve their
 * semantic meaning across the same perseus api major version.
 */

export const Options = {
        propTypes: PropTypes.shape({
            isArticle: PropTypes.bool.isRequired,

            satStyling: PropTypes.bool.isRequired,
            onInputError: PropTypes.func.isRequired,
            onFocusChange: PropTypes.func.isRequired,
            staticRender: PropTypes.bool.isRequired,
            GroupMetadataEditor: PropTypes.func.isRequired,
            showAlignmentOptions: PropTypes.bool.isRequired,
            readOnly: PropTypes.bool.isRequired,

            answerableCallback: PropTypes.func,
            getAnotherHint: PropTypes.func,
            interactionCallback: PropTypes.func,

            // A function that takes in the relative problem number (starts at
            // 0 and is incremented for each group widget), and the ID of the
            // group widget, then returns a react component that will be added
            // immediately above the renderer in the group widget. If the
            // function returns null, no annotation will be added.
            groupAnnotator: PropTypes.func.isRequired,

            // If imagePlaceholder or widgetPlaceholder are set, perseus will
            // render the placeholder instead of the image or widget node.
            imagePlaceholder: PropTypes.node,
            widgetPlaceholder: PropTypes.node,

            // Base React elements that can be used in place of the standard DOM
            // DOM elements. For example, when provided, <Link /> will be used
            // in place of <a />. This allows clients to provide pre-styled
            // components or components with custom behavior.
            baseElements: PropTypes.shape({
                // The <Link /> component provided here must adhere to the same
                // interface as React's base <a /> component.
                Link: PropTypes.func,
            }),

            // Function that takes dimensions and returns a React component
            // to display while an image is loading
            imagePreloader: PropTypes.func,

            // Function that takes an object argument. The object should
            // include type and id, both strings, at least and can optionally
            // include a boolean "correct" value. This is used for keeping
            // track of widget interactions.
            trackInteraction: PropTypes.func,

            // A boolean that indicates whether or not a custom keypad is
            // being used.  For mobile web this will be the ProvidedKeypad
            // component.  In this situation we use the MathInput component
            // from the math-input repo instead of the existing perseus math
            // input components.
            // TODO(charlie): Make this mutually exclusive with `staticRender`.
            // Internally, we defer to `customKeypad` over `staticRender`, but
            // they should really be represented as an enum or some other data
            // structure that forbids them both being enabled at once.
            customKeypad: PropTypes.bool,

            // Indicates whether or not to use mobile styling.
            isMobile: PropTypes.bool,

            // A function, called with a bool indicating whether use of the
            // drawing area (scratchpad) should be allowed/disallowed.
            // Previously handled by `Khan.scratchpad.enable/disable`
            setDrawingAreaAvailable: PropTypes.func,

            // Whether to use the Draft.js editor or the legacy textarea
            useDraftEditor: PropTypes.bool,

            // Styling options that control the visual behavior of Perseus
            // items.
            // TODO(mdr): If we adopt this pattern, we'll need to think about
            //     how to make individual `styling` options be optional, and
            //     how to set their default values without overwriting provided
            //     values. For now, though, you must either specify all fields
            //     of `styling`, or omit the `styling` option entirely.
            styling: PropTypes.shape({
                // Which version of radio widget styles to use in non-SAT
                // contexts.
                //
                // "legacy" was the version of the widget display after XOM but
                // before we started adding MCR styles. It doesn't have support
                // for rationales. It has since been removed.
                //
                // "intermediate" is a design which adds several new additions
                // to the "legacy" styles such as:
                //  1. Using the XOM "desktop" styles (with a visible check icon
                //     and lines in between choices) on mobile devices.
                //  2. Designs for rationales
                //  3. Using the single-select styles for multi-select styles
                //
                // "final" is a design which will build off of the
                // "intermediate" designs and adds some improved designs as well
                // as:
                //  1. a/b/c/d/etc. letters inside of the prompt check box
                //  2. New iconography and styles to indicate choice correctness
                //
                // The "legacy" and "intermediate" designs will be A/B tested
                // against each other to ensure that its changes don't cause
                // problems due to the new designs. Once the "intermediate"
                // designs are finished, they will be A/B tested against the
                // "final" designs.
                //
                // If no flag is provided, "legacy" styles will be shown.
                //
                // TODO(emily): Remove this by Aug 1, 2017, at which point all
                //   callsites should have been switched to using the "final"
                //   designs.
                radioStyleVersion: PropTypes.oneOf([
                    "intermediate",
                    "final",
                ]),
            }),

            // The color used for the hint progress indicator (eg. 1 / 3)
            hintProgressColor: PropTypes.string,
        }).isRequired,

        defaults: {
            isArticle: false,
            isMobile: false,
            satStyling: false,
            onInputError: function() {},
            onFocusChange: function() {},
            staticRender: false,
            GroupMetadataEditor: StubTagEditor,
            showAlignmentOptions: false,
            readOnly: false,
            groupAnnotator: function() {
                return null;
            },
            baseElements: {
                Link: props => {
                    return <a {...props} />;
                },
            },
            setDrawingAreaAvailable: function() {},
            useDraftEditor: false,
            styling: {
                radioStyleVersion: "final",
            },
        },
    };

export const ClassNames = {
        RENDERER: "perseus-renderer",
        TWO_COLUMN_RENDERER: "perseus-renderer-two-columns",
        RESPONSIVE_RENDERER: "perseus-renderer-responsive",
        INPUT: "perseus-input",
        FOCUSED: "perseus-focused",
        RADIO: {
            OPTION: "perseus-radio-option",
            SELECTED: "perseus-radio-selected",
            OPTION_CONTENT: "perseus-radio-option-content",
        },
        INTERACTIVE: "perseus-interactive",
        CORRECT: "perseus-correct",
        INCORRECT: "perseus-incorrect",
        UNANSWERED: "perseus-unanswered",
        MOBILE: "perseus-mobile",
    };


export default { Options: Options, ClassNames: ClassNames };
