import React, { ChangeEvent } from "react";

declare module "echo-test-goody" {
  export interface GruveEventWidgetsProps {
    eventAddress: string;
    isTest?: boolean;
    config?: {
      buttonColor: string;
    };
  }

  export const GruveEventWidgets: React.FC<GruveEventWidgetsProps>;

  export interface TextInputProps {
    type?: string;
    label?: string;
    value?: string;
    onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
    disabled?: boolean;
    required?: boolean;
    className?: string;
    name?: string;
    placeholder?: string;
    id?: any;
  }

  export const Textbox: React.FC<TextInputProps>;
}
