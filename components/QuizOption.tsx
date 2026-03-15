import { Option } from "@/types";
import { FormControlLabel, Radio } from "@mui/material";

interface QuizOptionProps {
  disabled?: boolean
  option: Option
}

export default function QuizOption({ disabled, option }: QuizOptionProps) {
  return (
    <FormControlLabel
      value={option.id}
      control={<Radio />}
      label={option.option}
      disabled={disabled}
    />
  )
}