import React from "react";
import { Popup, Page, Navbar, Link, List, ListInput, Button, Block } from "framework7-react";
import { Formik } from "formik";

interface Props {
    title: string,
    popupType?: "text" | "textarea",
    callbackDone: Function,
    initialValue: string,
    buttonText: string,
    inputPlaceholder?: string,
    inputInfo?: string,
    opened: boolean,
    onPopupClose: Function
}

export default class extends React.Component<Props> {
    validate = ({main}: {main: string}) => {
        if(main.length === 0 || main === this.props.initialValue)return {main: "invalid"};
        return {};
    }

    submit = ({main}: {main: string}) => {
        this.$f7.popup.close();
        this.props.callbackDone(main);
    }
    
    render() {
        return <Popup opened={this.props.opened} onPopupClose={() => this.props.onPopupClose()}>
            <Page>
                <Navbar title={this.props.title} large>
                    <Link slot="left" popupClose>Отмена</Link>
                </Navbar>
                <Formik
                    initialValues={{main: this.props.initialValue}}
                    validate={this.validate}
                    onSubmit={this.submit}
                    initialErrors={{main: "invalid"}}
                >{({values,
                    errors,
                    touched,
                    handleSubmit,
                    handleChange
                }) => {
                    return <>
                        <List>
                            {/* ADD CLEAR BUTTON SUPPORT */}
                            <ListInput 
                                type={this.props.popupType === "textarea" ? "textarea" : "text"} 
                                name="main"
                                label={this.props.title}
                                placeholder={this.props.inputPlaceholder} 
                                onChange={handleChange} 
                                info={this.props.inputInfo}
                                value={values.main}
                                required
                                validate
                            />
                        </List>
                        <Block>
                            <Button fill large onClick={handleSubmit} disabled={Object.keys(errors).length !== 0}>{this.props.buttonText}</Button>
                        </Block>
                    </>;
                }}</Formik>
            </Page>
        </Popup>
    }
}