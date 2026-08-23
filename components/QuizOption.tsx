import { Option } from "@/types";
import OptionView from "./OptionView";

interface QuizOptionProps {
  disabled?: boolean
  option: Option
}

export default function QuizOption({ disabled, option }: QuizOptionProps) {
  return (
    <OptionView
      value={option.id}
      label={option.option}
      disabled={disabled}
    />
  )
}