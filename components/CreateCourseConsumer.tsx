import {
  Button,
  Container,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
} from "@mui/material";
import { Fragment, useState } from "react";
// import { NEW_MODULE, NEW_QUIZ_QUESTION } from "../constants";
import { questionTypeSchema } from "@/types";
import { useCourseCreator } from "@/context/courseCreator";
import { useGlobal } from "@/context/globalContext";

export default function CreateCourseConsumer() {
  const global = useGlobal();
  const courseCreator = useCourseCreator();
  const [clearDialogOpened, setClearDialogOpened] = useState(false);

  if (!global.currentUser) {
    return <p>Unauthenticated</p>
  }

  if (
    !["instructor", "super_admin"].includes(global?.currentUser.role)
  ) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography variant="h3">
          You must be classified as an instructor to create a course.
        </Typography>
      </Container>
    );
  }

  function handleOpenClearDialog() {
    setClearDialogOpened(true);
  }

  function handleCloseClearDialog() {
    setClearDialogOpened(false);
  }

  return (
    <Container sx={{ mt: 8 }}>
      <Typography variant="h3" gutterBottom>
        Course Details
      </Typography>
      <Stack spacing={2}>
        <TextField
          name="title"
          variant="outlined"
          label="Course Title"
          fullWidth
          onChange={(event) =>
            courseCreator.updateTitle(event.target.value)
          }
          value={courseCreator.title}
        />
        <TextField
          name="course_description"
          variant="outlined"
          label="Course Description"
          value={courseCreator.description}
          onChange={(event) =>
            courseCreator.updateDescription(event.target.value)
          }
          fullWidth
          multiline
          rows={4}
        />
      </Stack>
      <Typography variant="h3" gutterBottom sx={{ mt: 2 }}>
        Course Modules
      </Typography>
      {courseCreator.modules.map((module, moduleIndex) => {
        return (
          <Stack spacing={2} sx={{ mb: 2 }} key={moduleIndex}>
            <TextField
              name="heading"
              variant="outlined"
              label="Module Name"
              fullWidth
              value={module.heading}
              onChange={(event) => {
                courseCreator.updateModule(
                  "heading",
                  moduleIndex,
                  event.target.value
                );
              }}
            />
            <TextField
              name="content"
              variant="outlined"
              label="Module Content"
              fullWidth
              value={module.content}
              onChange={(event) => {
                courseCreator.updateModule(
                  "content",
                  moduleIndex,
                  event.target.value
                );
              }}
            />
            <TextField
              name="estimated_minutes"
              variant="outlined"
              label="Estimated Minutes"
              fullWidth
              value={module.estimatedMinutes}
              onChange={(event) => {
                courseCreator.updateModule(
                  "estimatedMinutes",
                  moduleIndex,
                  Number(event.target.value)
                );
              }}
            />
            <Button
              onClick={() => {
                courseCreator.removeModule(moduleIndex);
              }}
            >
              Remove Module
            </Button>
          </Stack>
        );
      })}
      <Button
        variant="contained"
        color="primary"
        onClick={courseCreator.addModule}
      >
        Add Module
      </Button>
      <Typography variant="h3" gutterBottom sx={{ m: 2 }}>
        Course Quiz
      </Typography>

      {courseCreator.quizQuestions.map((question, questionIndex) => {
        const options = question.options.map((option, optionIndex) => {
          return (
            <Fragment key={optionIndex}>
              <TextField
                variant="outlined"
                label="Option"
                value={option}
                disabled={
                  question.questionType === "True/False"
                }
                onChange={(event) => {
                  courseCreator.updateOption(
                    questionIndex,
                    optionIndex,
                    event.target.value
                  );
                }}
              />
              {question.questionType !== "True/False" &&
                optionIndex > 1 && (
                  <Button
                    onClick={() => {
                      courseCreator.removeOption(
                        questionIndex,
                        optionIndex
                      );
                    }}
                  >
                    Remove Option
                  </Button>
                )}
            </Fragment>
          );
        });

        return (
          <Stack spacing={2} key={questionIndex}>
            <TextField
              name="heading"
              variant="outlined"
              label="Question text"
              fullWidth
              value={question.questionText}
              onChange={(event) => {
                courseCreator.updateQuestion(
                  "questionText",
                  questionIndex,
                  event.target.value
                );
              }}
              sx={{ mt: 2 }}
            />
            <InputLabel>Question type</InputLabel>
            <Select
              variant="outlined"
              value={question.questionType}
              onChange={(event) => {
                const newQuestionType = questionTypeSchema.parse(
                  event.target.value
                );
                const newOptions =
                  newQuestionType === "True/False"
                    ? ["True", "False"]
                    : question.options;

                courseCreator.updateQuestion(
                  "questionType",
                  questionIndex,
                  newQuestionType
                );
                courseCreator.updateQuestion(
                  "options",
                  questionIndex,
                  newOptions
                );
              }}
            >
              <MenuItem value="True/False">True/False</MenuItem>
              <MenuItem value="Multiple Choice">
                Multiple choice
              </MenuItem>
              <MenuItem value="All That Apply">
                All that apply
              </MenuItem>
            </Select>
            {question.questionType !== "True/False" && (
              <Button
                onClick={() => {
                  courseCreator.addOption(questionIndex);
                }}
              >
                Add Option
              </Button>
            )}
            {options}
            <InputLabel>Correct Answer (Choose)</InputLabel>
            <select
              value={question.correctOptionOrder}
              onChange={(event) => {
                courseCreator.updateQuestion(
                  "correctOptionOrder",
                  questionIndex,
                  Number(event.target.value)
                );
              }}
            >
              {question.options.map((option, optionIndex) => {
                return (
                  <option value={optionIndex} key={optionIndex}>
                    {option}
                  </option>
                );
              })}
            </select>
            <TextField
              name="explanation"
              variant="outlined"
              label="Explanation"
              value={question.explanation}
              placeholder="Explain why this is the correct answer or that the other answers are incorrect"
              onChange={(event) => {
                courseCreator.updateQuestion(
                  "explanation",
                  questionIndex,
                  event.target.value
                );
              }}
            />
            <Button
              onClick={() => {
                courseCreator.removeQuestion(questionIndex);
              }}
            >
              Remove Question
            </Button>
          </Stack>
        );
      })}
      <Button
        variant="contained"
        color="primary"
        onClick={courseCreator.addQuestion}
        sx={{ mb: 2 }}
      >
        Add Quiz Question
      </Button>
      <Stack direction={"row"} spacing={2} justifyContent={"flex-end"}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleOpenClearDialog}

        >
          Clear
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={courseCreator.submitCourse}
        >
          Save
        </Button>
      </Stack>
      <Dialog onClose={handleCloseClearDialog} open={clearDialogOpened}>
        <DialogTitle>
          Are you sure you want to clear the form?
        </DialogTitle>
        <DialogContent>
          All modules and quiz questions will be cleared. This cannot
          be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseClearDialog}>Cancel</Button>
          <Button
            onClick={() => {
              courseCreator.clearForm();
              handleCloseClearDialog();
            }}
            sx={{
              color: "error.main",
              "&:hover": {
                backgroundColor: "error.main",
                color: "white",
              },
              transition: "all 0.2s ease-in-out",
            }}
          >
            Clear
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}