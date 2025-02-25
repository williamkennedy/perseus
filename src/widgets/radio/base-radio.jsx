import _choiceJsx from "./choice.jsx";
import _utilJs from "../../util.js";
import _stylesMediaQueriesJs from "../../styles/media-queries.js";
import * as styleConstants from "../../styles/constants.js";
import _stylesSharedJs from "../../styles/shared.js";
import _rendererJsx from "../../renderer.jsx";
import _perseusApiJsx from "../../perseus-api.jsx";
import _underscore from "underscore";
import _reactDom from "react-dom";
import _react from "react";
import _classnames from "classnames";
import { StyleSheet, css } from "aphrodite";

var _module_ = {
    exports: {}
};

var exports = _module_.exports;
const classNames = _classnames;
const React = _react;
const ReactDOM = _reactDom;
const _ = _underscore;

const ApiClassNames = _perseusApiJsx.ClassNames;
const Renderer = _rendererJsx;
const sharedStyles = _stylesSharedJs;
const mediaQueries = _stylesMediaQueriesJs;

const captureScratchpadTouchStart = _utilJs
    .captureScratchpadTouchStart;

const Choice = _choiceJsx;

const ChoiceNoneAbove = createReactClass({
    propTypes: {
        className: PropTypes.string,
        content: PropTypes.node,
        showContent: PropTypes.bool,
    },

    getDefaultProps: function() {
        return {
            showContent: true,
        };
    },

    render: function() {
        const choiceProps = _.extend({}, this.props, {
            className: classNames(this.props.className, "none-of-above"),
            content: this.props.showContent
                ? this.props.content
                : // We use a Renderer here because that is how
                  // `this.props.content` is wrapped otherwise.
                  // We pass in a key here so that we avoid a semi-spurious
                  // react warning when we render this in the same place
                  // as the previous choice content renderer.
                  // Note this destroys state, but since all we're doing
                  // is outputting "None of the above", that is okay.
                  <Renderer
                      key="noneOfTheAboveRenderer"
                      content={i18n._("None of the above")}
                  />,
        });

        return <Choice {...choiceProps} />;
    },
});

const ChoicesType = PropTypes.arrayOf(
    PropTypes.shape({
        // Indicates whether this choice is checked.
        checked: PropTypes.bool,

        // Indicates whether the user has "crossed out" this choice, meaning
        // that they don't think it's correct. This value does not affect
        // scoring or other behavior; it's just a note for the user's
        // reference.
        crossedOut: PropTypes.bool,

        content: PropTypes.node,
        rationale: PropTypes.node,
        hasRationale: PropTypes.bool,
        showRationale: PropTypes.bool,
        showCorrectness: PropTypes.bool,
        correct: PropTypes.bool,
        originalIndex: PropTypes.number,
        isNoneOfTheAbove: PropTypes.bool,
    })
);

const radioBorderColor = styleConstants.radioBorderColor;

const BaseRadio = createReactClass({
    propTypes: {
        apiOptions: PropTypes.shape({
            readOnly: PropTypes.bool,
            satStyling: PropTypes.bool,
            isMobile: PropTypes.bool,
            styling: PropTypes.shape({
                radioStyleVersion: PropTypes.oneOf([
                    "intermediate",
                    "final",
                ]),
            }),
        }),
        choices: ChoicesType,
        deselectEnabled: PropTypes.bool,
        editMode: PropTypes.bool,
        labelWrap: PropTypes.bool,
        countChoices: PropTypes.bool,
        numCorrect: PropTypes.number,
        multipleSelect: PropTypes.bool,
        reviewModeRubric: PropTypes.shape({
            choices: ChoicesType,
        }),

        // A callback indicating that this choice has changed. Its argument is
        // an object with two keys: `checked` and `crossedOut`. Each contains
        // an array of boolean values, specifying the new checked and
        // crossed-out value of each choice.
        onChange: PropTypes.func,
    },

    statics: {
        styles: StyleSheet.create({
            instructions: {
                display: "block",
                color: styleConstants.gray17,
                fontSize: 14,
                lineHeight: 1.25,
                fontStyle: "normal",
                fontWeight: "bold",
                marginBottom: 16,
            },

            instructionsMobile: {
                fontSize: 18,
                [mediaQueries.smOrSmaller]: {
                    fontSize: 16,
                },
                // TODO(emily): We want this to match choice text, which turns
                // to 20px at min-width 1200px, but this media query is
                // min-width 1280px because our media queries don't exactly
                // match pure. Make those match up.
                [mediaQueries.xl]: {
                    fontSize: 20,
                },
            },

            radio: {
                // Avoid centering
                width: "100%",
            },

            responsiveRadioContainer: {
                borderBottom: `1px solid ${radioBorderColor}`,
                borderTop: `1px solid ${radioBorderColor}`,
                width: "auto",
                [mediaQueries.smOrSmaller]: {
                    marginLeft: styleConstants.negativePhoneMargin,
                    marginRight: styleConstants.negativePhoneMargin,
                },
            },

            radioContainerFirstHighlighted: {
                borderTop: `1px solid rgba(0, 0, 0, 0)`,
            },

            radioContainerLastHighlighted: {
                borderBottom: `1px solid rgba(0, 0, 0, 0)`,
            },

            satRadio: {
                background: "none",
                marginLeft: 0,
                userSelect: "none",
            },

            satRadioOption: {
                margin: 0,
                padding: 0,
                borderBottom: `1px solid #ccc`,
                ":first-child": {
                    borderTop: `1px solid #ccc`,
                },
            },

            satRadioOptionCorrect: {
                borderBottomColor: styleConstants.satCorrectBorderColor,
                ":first-child": {
                    borderTopColor: styleConstants.satCorrectBorderColor,
                },
            },

            satRadioOptionIncorrect: {
                borderBottomColor: styleConstants.satIncorrectBorderColor,
                ":first-child": {
                    borderTopColor: styleConstants.satIncorrectBorderColor,
                },
            },

            satRadioOptionNextCorrect: {
                borderBottomColor: styleConstants.satCorrectBorderColor,
            },

            satRadioOptionNextIncorrect: {
                borderBottomColor: styleConstants.satIncorrectBorderColor,
            },

            satReviewRadioOption: {
                pointerEvents: "none",
            },

            item: {
                marginLeft: 20,
            },

            inlineItem: {
                display: "inline-block",
                paddingLeft: 20,
                verticalAlign: "middle",
                // See http://stackoverflow.com/q/8120466 for explanation of
                // why vertical align property is needed
            },

            responsiveItem: {
                marginLeft: 0,
                padding: 0,

                ":not(:last-child)": {
                    borderBottom: `1px solid ${radioBorderColor}`,
                },
            },

            selectedItem: {
                background: "white",
            },

            aboveBackdrop: {
                position: "relative",
                // HACK(emily): We want selected choices to show up above our
                // exercise backdrop, but below the exercise footer and
                // "feedback popover" that shows up. This z-index is carefully
                // coordinated between here and webapp. :(
                zIndex: 1062,
            },

            aboveBackdropMobile: {
                boxShadow:
                    "0 0 4px 0 rgba(0, 0, 0, 0.2)," +
                    "0 0 2px 0 rgba(0, 0, 0, 0.1)",

                ":not(:last-child)": {
                    borderBottom: `1px solid rgba(0, 0, 0, 0)`,
                },
            },

            nextHighlighted: {
                ":not(:last-child)": {
                    borderBottom: `1px solid rgba(0, 0, 0, 0)`,
                },
            },

            responsiveContainer: {
                overflow: "auto",
                marginLeft: styleConstants.negativePhoneMargin,
                marginRight: styleConstants.negativePhoneMargin,
                paddingLeft: styleConstants.phoneMargin,
                // paddingRight is handled by responsiveFieldset
            },

            responsiveFieldset: {
                paddingRight: styleConstants.phoneMargin,
            },
        }),
    },

    getDefaultProps: function() {
        return {
            editMode: false,
        };
    },

    getInitialState: function() {
        return {
            // TODO(mdr): This keeps the ID stable across re-renders on the
            //     same machine, but, at time of writing, the server's state
            //     isn't rehydrated to the client during SSR, so the server and
            //     client will generate different IDs and cause a mismatch
            //     during SSR :(
            radioGroupName: _.uniqueId("perseus_radio_"),
        };
    },

    // When a particular choice's `onChange` handler is called, indicating a
    // change in a single choice's values, we need to call our `onChange`
    // handler in order to notify our parent. However, our API with our parent
    // is that we always provide *all* values for *all* choices, even if just
    // one choice's values changed. (This is because sometimes an interaction
    // with one choice can affect many choices, like how checking a new answer
    // will usually cause the old answer to become unchecked.)
    //
    // So, given the new values for a particular choice, compute the new values
    // for all choices, and pass them to `this.props.onChange`.
    //
    // `newValues` is an object with two keys: `checked` and `crossedOut`. Each
    // contains a boolean value specifying the new checked and crossed-out
    // value of this choice.
    updateChoice: function(choiceIndex, newValues) {
        // Get the baseline `checked` values. If we're checking a new answer
        // and multiple-select is not on, we should clear all choices to be
        // unchecked. Otherwise, we should copy the old checked values.
        let newCheckedList;
        if (newValues.checked && !this.props.multipleSelect) {
            newCheckedList = this.props.choices.map(_ => false);
        } else {
            newCheckedList = this.props.choices.map(c => c.checked);
        }

        // Get the baseline `crossedOut` values.
        const newCrossedOutList = this.props.choices.map(c => c.crossedOut);

        // Update this choice's `checked` and `crossedOut` values.
        newCheckedList[choiceIndex] = newValues.checked;
        newCrossedOutList[choiceIndex] = newValues.crossedOut;

        this.props.onChange({
            checked: newCheckedList,
            crossedOut: newCrossedOutList,
        });
    },

    focus: function(i) {
        ReactDOM.findDOMNode(this.refs["radio" + (i || 0)]).focus();
        return true;
    },

    getInstructionsText: function() {
        if (this.props.multipleSelect) {
            if (this.props.countChoices) {
                return i18n._("Choose %(numCorrect)s answers:", {
                    numCorrect: this.props.numCorrect,
                });
            } else {
                return i18n._("Choose all answers that apply:");
            }
        } else {
            return i18n._("Choose 1 answer:");
        }
    },

    deselectEnabled: function() {
        // We want to force enable deselect on mobile.
        return this.props.apiOptions.isMobile || this.props.deselectEnabled;
    },

    render: function() {
        const inputType = this.props.multipleSelect ? "checkbox" : "radio";
        const rubric = this.props.reviewModeRubric;
        const reviewMode = !!rubric;

        const styles = BaseRadio.styles;
        const sat = this.props.apiOptions.satStyling;

        const isMobile = this.props.apiOptions.isMobile;

        const choices = this.props.choices;
        const firstChoiceHighlighted = choices[0].highlighted;
        const lastChoiceHighlighted = choices[choices.length - 1].highlighted;

        const className = classNames(
            "perseus-widget-radio",
            !this.props.editMode && "perseus-rendered-radio",
            css(
                styles.radio,
                // SAT doesn't use the "responsive styling" as it conflicts
                // with their custom theming.
                !sat && styles.responsiveRadioContainer,
                !sat &&
                    firstChoiceHighlighted &&
                    isMobile &&
                    styles.radioContainerFirstHighlighted,
                !sat &&
                    lastChoiceHighlighted &&
                    isMobile &&
                    styles.radioContainerLastHighlighted,
                sat && styles.satRadio
            )
        );

        const instructionsClassName = classNames(
            "instructions",
            css(styles.instructions, isMobile && styles.instructionsMobile)
        );
        const instructions = this.getInstructionsText();
        const shouldShowInstructions = !sat;

        const responsiveClassName = css(styles.responsiveFieldset);
        const fieldset = (
            <fieldset
                className={`perseus-widget-radio-fieldset ${responsiveClassName}`} // eslint-disable-line max-len
            >
                <legend className="perseus-sr-only">
                    {instructions}
                </legend>
                {shouldShowInstructions &&
                    <div className={instructionsClassName}>
                        {instructions}
                    </div>}
                <ul className={className}>
                    {this.props.choices.map(function(choice, i) {
                        let Element = Choice;
                        const elementProps = {
                            ref: `radio${i}`,
                            apiOptions: this.props.apiOptions,
                            checked: choice.checked,
                            crossedOut: choice.crossedOut,
                            reviewMode,
                            correct: choice.correct,
                            rationale: choice.rationale,
                            content: choice.content,
                            disabled:
                                this.props.apiOptions.readOnly ||
                                choice.disabled,
                            editMode: this.props.editMode,
                            groupName: this.state.radioGroupName,
                            isLastChoice: i === this.props.choices.length - 1,
                            showCorrectness:
                                reviewMode || !!choice.showCorrectness,
                            showRationale:
                                choice.hasRationale &&
                                (reviewMode || choice.showRationale),
                            type: inputType,
                            pos: i,
                            deselectEnabled: this.deselectEnabled(),
                            onChange: newValues => {
                                this.updateChoice(i, newValues);
                            },
                        };

                        if (choice.isNoneOfTheAbove) {
                            Element = ChoiceNoneAbove;
                            _.extend(elementProps, {
                                showContent: choice.revealNoneOfTheAbove,
                            });
                        }

                        const nextChoice = this.props.choices[i + 1];
                        const nextChoiceHighlighted =
                            !!nextChoice && nextChoice.highlighted;

                        const aphroditeClassName = checked => {
                            // Whether or not to show correctness borders
                            // for this choice and the next choice.
                            const satShowCorrectness =
                                sat && reviewMode && checked;
                            const satShowCorrectnessNext =
                                sat &&
                                reviewMode &&
                                nextChoice &&
                                nextChoice.checked;

                            return css(
                                sharedStyles.aboveScratchpad,
                                styles.item,
                                !sat && styles.responsiveItem,
                                !sat && checked && styles.selectedItem,
                                !sat &&
                                    checked &&
                                    choice.highlighted &&
                                    styles.aboveBackdrop,
                                !sat &&
                                    checked &&
                                    choice.highlighted &&
                                    this.props.apiOptions.isMobile &&
                                    styles.aboveBackdropMobile,
                                !sat &&
                                    nextChoiceHighlighted &&
                                    this.props.apiOptions.isMobile &&
                                    styles.nextHighlighted,
                                sat && styles.satRadioOption,
                                satShowCorrectness &&
                                    !choice.correct &&
                                    styles.satRadioOptionIncorrect,
                                satShowCorrectness &&
                                    choice.correct &&
                                    styles.satRadioOptionCorrect,
                                satShowCorrectnessNext &&
                                    !nextChoice.correct &&
                                    styles.satRadioOptionNextIncorrect,
                                satShowCorrectnessNext &&
                                    nextChoice.correct &&
                                    styles.satRadioOptionNextCorrect,
                                sat && rubric && styles.satReviewRadioOption
                            );
                        };

                        // HACK(abdulrahman): Preloads the selection-state
                        // css because of a bug that causes iOS to lag
                        // when selecting the button for the first time.
                        aphroditeClassName(true);

                        const className = classNames(
                            aphroditeClassName(choice.checked),
                            // TODO(aria): Make test case for these API
                            // classNames
                            ApiClassNames.RADIO.OPTION,
                            choice.checked && ApiClassNames.RADIO.SELECTED,
                            reviewMode &&
                                rubric.choices[i].correct &&
                                ApiClassNames.CORRECT,
                            reviewMode &&
                                !rubric.choices[i].correct &&
                                ApiClassNames.INCORRECT
                        );

                        // In edit mode, the Choice renders a Div in order to
                        // allow for the contentEditable area to be selected
                        // (label forces any clicks inside to select the input
                        // element) We have to add some extra behavior to make
                        // sure that we can still check the choice.
                        let listElem = null;
                        let clickHandler = null;
                        if (this.props.editMode) {
                            clickHandler = e => {
                                // Traverse the parent nodes of the clicked
                                // element.
                                let elem = e.target;
                                while (elem && elem !== listElem) {
                                    // If the clicked element is inside of the
                                    // radio icon, then we want to trigger the
                                    // check by flipping the choice of the icon.
                                    if (
                                        elem.getAttribute("data-is-radio-icon")
                                    ) {
                                        this.updateChoice(
                                            i, {checked: !choice.checked});
                                        return;
                                    }
                                    elem = elem.parentNode;
                                }
                            };
                        }

                        // TODO(mattdr): Index isn't a *good* choice of key
                        // here; is there a better one? Can we use choice
                        // content somehow? Would changing our choice of key
                        // somehow break something happening inside a choice's
                        // child Renderers, by changing when we mount/unmount?
                        return (
                            <li
                                key={i}
                                ref={e => listElem = e}
                                className={className}
                                onClick={clickHandler}
                                onTouchStart={
                                    !this.props.labelWrap
                                        ? null
                                        : captureScratchpadTouchStart
                                }
                            >
                                <Element {...elementProps} />
                            </li>
                        );
                    }, this)}
                </ul>
            </fieldset>
        );

        // Allow for horizontal scrolling if content is too wide, which may be
        // an issue especially on phones.
        // This is disabled in SAT, since it conflicts with their theming.
        return (
            <div className={css(!sat && styles.responsiveContainer)}>
                {fieldset}
            </div>
        );
    },
});

_module_.exports = BaseRadio;
export default _module_.exports;
