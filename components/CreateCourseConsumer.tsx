import {
  Button,
  Container,
  FormControl,
  Grid2,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  TextField,
  Typography,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  Alert,
  Box,
  Card,
  CardContent,
  IconButton,
} from "@mui/material";
import { Fragment, useState } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { questionTypeSchema } from "@/types";
import { useCourseCreator } from "@/context/courseCreator";
import { useGlobal } from "@/context/globalContext";

const textFieldSx = {
  "& .MuiInputBase-root": {
    height: "56px",
  },
  input: {
    color: "var(--black-color)",
    padding: "16.5px 14px",
  },
  "& .MuiInputBase-inputMultiline": {
    padding: "16.5px 14px",
    height: "auto",
  },
};

export default function CreateCourseConsumer() {
  const global = useGlobal();
  const courseCreator = useCourseCreator();
  const [clearDialogOpened, setClearDialogOpened] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  if (!global.currentUser) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">Unauthenticated</Alert>
      </Container>
    );
  }

  if (!["instructor", "super_admin"].includes(global?.currentUser.role)) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="warning">
          You must be classified as an instructor to create a course.
        </Alert>
      </Container>
    );
  }

  const handleOpenClearDialog = () => setClearDialogOpened(true);
  const handleCloseClearDialog = () => setClearDialogOpened(false);

  const handleSubmitCourse = async () => {
    try {
      await courseCreator.submitCourse();
      setSubmitStatus({
        type: "success",
        message: "Course created successfully!",
      });
      courseCreator.clearForm();
      setTimeout(() => setSubmitStatus(null), 5000);
    } catch (error) {
      setSubmitStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to create course",
      });
      setTimeout(() => setSubmitStatus(null), 5000);
    }
  };

  const handleQuestionTypeChange = (
    event: SelectChangeEvent<string>,
    questionIndex: number
  ) => {
    const newQuestionType = questionTypeSchema.parse(event.target.value);
    const currentQuestion = courseCreator.quizQuestions[questionIndex];
    const newOptions =
      newQuestionType === "True/False"
        ? ["True", "False"]
        : currentQuestion.options;

    courseCreator.updateQuestion("questionType", questionIndex, newQuestionType);
    courseCreator.updateQuestion("options", questionIndex, newOptions);
  };

  const handleCorrectAnswerChange = (
    event: SelectChangeEvent<string>,
    questionIndex: number
  ) => {
    courseCreator.updateQuestion(
      "correctOptionOrder",
      questionIndex,
      Number(event.target.value)
    );
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {submitStatus && (
        <Alert
          severity={submitStatus.type}
          sx={{ mb: 3 }}
          onClose={() => setSubmitStatus(null)}
        >
          {submitStatus.message}
        </Alert>
      )}

      <Typography variant="h3" gutterBottom>
        Course Details
      </Typography>
      <Stack spacing={3} sx={{ mb: 4 }}>
        <TextField
          name="title"
          variant="outlined"
          label="Course Title"
          fullWidth
          required
          onChange={(event) => courseCreator.updateTitle(event.target.value)}
          value={courseCreator.title}
          sx={textFieldSx}
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
          required
          sx={textFieldSx}
        />
        <TextField
          name="ce_hours"
          variant="outlined"
          label="Continuing Education (CE) Hours"
          value={courseCreator.ceHours}
          onChange={(event) => courseCreator.updateCeHours(event.target.value)}
          fullWidth
          type="number"
          inputProps={{ min: 1 }}
          sx={textFieldSx}
        />
      </Stack>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="h3">Course Modules</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={courseCreator.addModule}
            sx={{
              bgcolor: "var(--secondary-color)",
              "&:hover": {
                bgcolor: "var(--primary-color)",
              },
            }}
          >
            Add Module
          </Button>
        </Box>
        <Grid2 container spacing={3}>
          {courseCreator.modules.map((module, moduleIndex) => (
            <Grid2 size={{ xs: 12 }} key={moduleIndex}>
              <Card variant="outlined">
                <CardContent>
                  <Stack spacing={2}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Typography variant="h6">Module {moduleIndex + 1}</Typography>
                      <IconButton
                        color="error"
                        onClick={() => courseCreator.removeModule(moduleIndex)}
                        disabled={courseCreator.modules.length === 1}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                    <TextField
                      name="heading"
                      variant="outlined"
                      label="Module Name"
                      fullWidth
                      required
                      value={module.heading}
                      onChange={(event) => {
                        courseCreator.updateModule(
                          "heading",
                          moduleIndex,
                          event.target.value
                        );
                      }}
                      sx={textFieldSx}
                    />
                    <TextField
                      name="content"
                      variant="outlined"
                      label="Module Content"
                      fullWidth
                      required
                      multiline
                      rows={4}
                      value={module.content}
                      onChange={(event) => {
                        courseCreator.updateModule(
                          "content",
                          moduleIndex,
                          event.target.value
                        );
                      }}
                      sx={textFieldSx}
                    />
                    <TextField
                      name="estimated_minutes"
                      variant="outlined"
                      label="Estimated Minutes"
                      fullWidth
                      required
                      type="number"
                      inputProps={{ min: 0 }}
                      value={module.estimatedMinutes || ""}
                      onChange={(event) => {
                        courseCreator.updateModule(
                          "estimatedMinutes",
                          moduleIndex,
                          Number(event.target.value) || 0
                        );
                      }}
                      sx={textFieldSx}
                    />
                  </Stack>
                </CardContent>
              </Card>
            </Grid2>
          ))}
        </Grid2>
      </Box>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="h3">Course Quiz</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={courseCreator.addQuestion}
            sx={{
              bgcolor: "var(--secondary-color)",
              "&:hover": {
                bgcolor: "var(--primary-color)",
              },
            }}
          >
            Add Quiz Question
          </Button>
        </Box>
        <Grid2 container spacing={3}>
          {courseCreator.quizQuestions.map((question, questionIndex) => (
            <Grid2 size={{ xs: 12 }} key={questionIndex}>
              <Card variant="outlined">
                <CardContent>
                  <Stack spacing={3}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Typography variant="h6">Question {questionIndex + 1}</Typography>
                      <IconButton
                        color="error"
                        onClick={() => courseCreator.removeQuestion(questionIndex)}
                        disabled={courseCreator.quizQuestions.length === 1}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>

                    <TextField
                      name="questionText"
                      variant="outlined"
                      label="Question Text"
                      fullWidth
                      required
                      value={question.questionText}
                      onChange={(event) => {
                        courseCreator.updateQuestion(
                          "questionText",
                          questionIndex,
                          event.target.value
                        );
                      }}
                      sx={textFieldSx}
                    />

                    <FormControl fullWidth>
                      <InputLabel>Question Type</InputLabel>
                      <Select
                        label="Question Type"
                        value={question.questionType}
                        onChange={(event) =>
                          handleQuestionTypeChange(event, questionIndex)
                        }
                        sx={{
                          "& .MuiInputBase-root": {
                            height: "56px",
                          },
                        }}
                      >
                        <MenuItem value="True/False">True/False</MenuItem>
                        <MenuItem value="Multiple Choice">Multiple Choice</MenuItem>
                        <MenuItem value="All That Apply">All That Apply</MenuItem>
                      </Select>
                    </FormControl>

                    {question.questionType !== "True/False" && (
                      <Button
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={() => courseCreator.addOption(questionIndex)}
                        sx={{ alignSelf: "flex-start" }}
                      >
                        Add Option
                      </Button>
                    )}

                    <Stack spacing={2}>
                      {question.options.map((option, optionIndex) => (
                        <Box
                          key={optionIndex}
                          sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}
                        >
                          <TextField
                            variant="outlined"
                            label={`Option ${optionIndex + 1}`}
                            fullWidth
                            value={option}
                            disabled={question.questionType === "True/False"}
                            onChange={(event) => {
                              courseCreator.updateOption(
                                questionIndex,
                                optionIndex,
                                event.target.value
                              );
                            }}
                            sx={textFieldSx}
                          />
                          {question.questionType !== "True/False" &&
                            optionIndex > 1 && (
                              <IconButton
                                color="error"
                                onClick={() => {
                                  courseCreator.removeOption(
                                    questionIndex,
                                    optionIndex
                                  );
                                }}
                                sx={{ mt: 1 }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            )}
                        </Box>
                      ))}
                    </Stack>

                    <FormControl fullWidth>
                      <InputLabel>Correct Answer</InputLabel>
                      <Select
                        label="Correct Answer"
                        value={question.correctOptionOrder.toString()}
                        onChange={(event) =>
                          handleCorrectAnswerChange(event, questionIndex)
                        }
                        sx={{
                          "& .MuiInputBase-root": {
                            height: "56px",
                          },
                        }}
                      >
                        {question.options.map((option, optionIndex) => (
                          <MenuItem value={optionIndex.toString()} key={optionIndex}>
                            {option || `Option ${optionIndex + 1}`}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <TextField
                      name="explanation"
                      variant="outlined"
                      label="Explanation"
                      fullWidth
                      multiline
                      rows={3}
                      value={question.explanation}
                      placeholder="Explain why this is the correct answer or why other answers are incorrect"
                      onChange={(event) => {
                        courseCreator.updateQuestion(
                          "explanation",
                          questionIndex,
                          event.target.value
                        );
                      }}
                      sx={textFieldSx}
                    />
                  </Stack>
                </CardContent>
              </Card>
            </Grid2>
          ))}
        </Grid2>
      </Box>
      <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 4 }}>
        <Button
          variant="outlined"
          color="error"
          onClick={handleOpenClearDialog}
        >
          Clear Form
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmitCourse}
          sx={{
            bgcolor: "var(--secondary-color)",
            "&:hover": {
              bgcolor: "var(--primary-color)",
            },
          }}
        >
          Save Course
        </Button>
      </Stack>

      <Dialog onClose={handleCloseClearDialog} open={clearDialogOpened}>
        <DialogTitle>Clear Form?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to clear the form? All modules and quiz
            questions will be cleared. This cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseClearDialog}>Cancel</Button>
          <Button
            onClick={() => {
              courseCreator.clearForm();
              handleCloseClearDialog();
            }}
            color="error"
            variant="contained"
          >
            Clear
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}