/** One option of a `SelectField`: the value it stands for and the text it shows. */
export type SelectChoice<Value extends string> = {
    value: Value;
    label: string;
};
