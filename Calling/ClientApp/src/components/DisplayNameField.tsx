import React from 'react';
import { TextField } from '@fluentui/react';

import {
    inputBoxStyle,
    inputBoxTextStyle,
    inputBoxWarningStyle,
    labelFontStyle,
    warningStyle
} from './styles/Configuration.styles';

interface DisplayNameFieldProps {
    setName(name: string): void;
    name: string;
    setEmptyWarning(isEmpty: boolean): void;
    isEmpty: boolean;
    fieldName: string;
    warningMessage: string;
}

const TextFieldStyleProps = {
    wrapper: {
        height: '2.3rem'
    },
    fieldGroup: {
        height: '2.3rem'
    }
};

export const DisplayNameField = (props: DisplayNameFieldProps): JSX.Element => {
    const onNameTextChange = (event: any) => {
        props.setName(event.target.value);
        if (event.target.value) {
            props.setEmptyWarning(false);
        } else {
            props.setEmptyWarning(true);
        }
    };

    const ariaLabel = "Choose your " + props.fieldName
    const placeholder = "Enter your " + props.fieldName

    return (
        <div>
            <div className={labelFontStyle}>{props.fieldName}</div>
            <TextField
                autoComplete="off"
                inputClassName={inputBoxTextStyle}
                ariaLabel={ariaLabel}
                borderless={true}
                className={props.isEmpty ? inputBoxWarningStyle : inputBoxStyle}
                onChange={onNameTextChange}
                id="name"
                placeholder={placeholder}
                defaultValue={props.name}
                styles={TextFieldStyleProps}
            />
            {props.isEmpty && (
                <div role="alert" className={warningStyle}>
                    {' '}
                    {props.warningMessage}{' '}
                </div>
            )}
        </div>
    );
};
