import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { FormFieldDefinition, isFormFieldVisible } from "commonlib";

export default function DynamicFormFields(props: {
  fields: FormFieldDefinition[];
  values: Record<string, string>;
  errors: Record<string, string | undefined>;
  touched: Record<string, boolean | undefined>;
  submitCount?: number;
  hideFieldKeys?: string[];
  onChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  onBlur: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
}) {
  const hiddenKeys = props.hideFieldKeys || [];
  const visibleFields: FormFieldDefinition[] = [];
  for (let i = 0; i < props.fields.length; i++) {
    const field = props.fields[i];
    if (hiddenKeys.includes(field.Key)) {
      continue;
    }
    if (isFormFieldVisible(field, props.values)) {
      visibleFields.push(field);
    }
  }

  const sections: string[] = [];
  for (let i = 0; i < visibleFields.length; i++) {
    const section = visibleFields[i].Section || "Details";
    if (!sections.includes(section)) {
      sections.push(section);
    }
  }

  return (
    <Stack spacing={4}>
      {sections.map((section) => {
        const sectionFields = visibleFields.filter((field) => (field.Section || "Details") === section);
        return (
          <Stack key={section} spacing={2}>
            <Typography variant="h6" fontWeight={700}>
              {section}
            </Typography>
            <Stack spacing={2}>
              {sectionFields.map((field) => {
                const value = props.values[field.Key] || "";
                const showError =
                  (!!props.touched[field.Key] || (props.submitCount || 0) > 0) && !!props.errors[field.Key];
                const commonProps = {
                  key: field.Key,
                  name: field.Key,
                  label: field.Label,
                  value,
                  required: !!field.Required,
                  placeholder: field.Placeholder,
                  fullWidth: true,
                  error: showError,
                  helperText: showError ? props.errors[field.Key] : undefined,
                  onChange: props.onChange,
                  onBlur: props.onBlur,
                };

                if (field.Type === "select" || field.Type === "radio") {
                  return (
                    <TextField select {...commonProps}>
                      {(field.Options || []).map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </TextField>
                  );
                }

                return (
                  <TextField
                    {...commonProps}
                    type={
                      field.Type === "email"
                        ? "email"
                        : field.Type === "number"
                          ? "number"
                          : field.Type === "date"
                            ? "date"
                            : field.Type === "mobile"
                              ? "tel"
                              : "text"
                    }
                    InputLabelProps={field.Type === "date" ? { shrink: true } : undefined}
                    inputProps={field.Type === "mobile" ? { inputMode: "numeric", maxLength: 10 } : undefined}
                  />
                );
              })}
            </Stack>
          </Stack>
        );
      })}
    </Stack>
  );
}
