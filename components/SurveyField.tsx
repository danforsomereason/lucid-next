import { FormControl, RadioGroup } from "@mui/material"
import OptionView from "./OptionView"
import { useCourseModules } from "@/context/courseModulesContext"
import LucidInput from "./LucidInput"
import { SURVEY_QUESTIONS } from "@/constants"

export default function SurveyField() {
  const courseModules = useCourseModules()
  const question = SURVEY_QUESTIONS[courseModules.surveyAnswers.length]
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