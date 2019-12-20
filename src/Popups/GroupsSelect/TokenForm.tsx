import React, { useRef } from "react";
import { Page, Navbar, List, ListInput, Button, Block, Preloader } from "framework7-react";
import serverRequest from "../../Backend";
import { _t } from "../../Localization";
import { isValidGroupToken } from "../../Helpers/URLParams";

interface State {
    tokenValue: string,
    isValid: boolean,
    doNotShowError: boolean,
    isCheckingToken: boolean
}

export default class extends React.Component<{}, State> {
    abortController = new AbortController();
    state: State = {
        tokenValue: "",
        isValid: false,
        doNotShowError: true,
        isCheckingToken: false
    }

    handleChange = (tokenValue) => {
        // let isTokenValid = isValidGroupToken(tokenValue);
        // if (isTokenValid) {
        //     getGroupInfoFromToken(tokenValue, this.abortController)
        //         .finally(() => {
        //             this.setState({
        //                 isCheckingToken: false
        //             });
        //         })
        //         .then(groupInfo => {
        //             if (!groupInfo) {
        //                 this.$f7.toast.show({
        //                     text: "Группа с таким ключом не существует",
        //                     closeTimeout: 1500
        //                 })
        //             } else {
        //                 this.setState({
        //                     isValid: true
        //                 });
        //             }
        //         })
        // }
        // this.setState({
        //     tokenValue,
        //     isCheckingToken: isTokenValid,
        //     isValid: false,
        //     doNotShowError: false
        // });
    }

    submitForm = () => {
        serverRequest("group.Join", {
            token: this.state.tokenValue
        })
            .then(response => {
                if (response.hasError) return;
                this.$f7.views.current.router.back();
            });
    }

    handleBlur = (e) => {
        if (e.target.value.length === 0) {
            this.setState({
                doNotShowError: true
            });
        }
    }
}

let TokenForm: React.FC = () => {
    let inputRef = useRef(null as HTMLInputElement);

    return <Page>
        <Navbar title="Вход по ключу" backLink={_t("Back")} />
        <List noHairlinesMd>
            <ListInput
                outline
                label="Токен ключу"
                floatingLabel
                clearButton
                value={this.state.tokenValue}
                onChange={e => this.handleChange(e.target.value)}
                onInputClear={() => this.handleChange("")}
                validate={false}
                autocomplete="off"
                errorMessage="Это не ключ группы"
                errorMessageForce={!this.state.isValid && !this.state.doNotShowError}
                onBlur={this.handleBlur}
                required
                placeholder="fe"
                input={false}
            >
                <input
                    placeholder="К"
                    ref={inputRef}
                />
            </ListInput>
        </List>
        <Block>
            {this.state.isCheckingToken ?
                <Button large fill disabled>
                    <Preloader color="white" /> Проверка
                        </Button> :
                <Button large fill disabled={!this.state.isValid} onClick={this.submitForm}>
                    Войти в группу
                        </Button>
            }
        </Block>
    </Page>
}