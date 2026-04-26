import { Option } from "@/types";
import { FormControlLabel, Radio } from "@mui/material";

interface OptionViewProps {
  disabled?: boolean
  label?: string
  value: string
}

export default function OptionView({ disabled, value, label }: OptionViewProps) {
  const l = label ?? value
  return (
    <FormControlLabel
      value={value}
      control={<Radio />}
      label={l}
      disabled={disabled}
    />
  )
}