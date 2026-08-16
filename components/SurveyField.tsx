import { FormControl, RadioGroup } from "@mui/material"
import OptionView from "./OptionView"
import { useCourseModules } from "@/context/CourseModulesContext"
import LucidInput from "./LucidInput"

export default function SurveyField() {
  const courseModules = useCourseModules()
  if (courseModules.surveyAnswers.length < 11) {
    return (
      <FormControl component="fieldset">
        <RadioGroup
          value={courseModules.surveyAnswer}
          onChange={(event) => {
            courseModules.selectSurveyAnswer(event.target.value)
          }}
        >
          <OptionView value='Not Applicable' />
          <OptionView value='Needs Improvement' />
          <OptionView value='Average' />
          <OptionView value='Good' />
          <OptionView value='Very Good' />
          <OptionView value='Excellent' />
        </RadioGroup>
      </FormControl>
    )
  }
  return (
    <LucidInput
      name="survey"
      variant="outlined"
      label="Answer"
      fullWidth
      required
      value={courseModules.surveyAnswer}
      onChange={(event) => {
        courseModules.selectSurveyAnswer(event.target.value)
      }}
    />
  )
}