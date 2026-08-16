'use client';

import { Typography } from "@mui/material";
import ModulesHelpButton from "./ModulesHelpButton";
import ModulesQuizNav from "./ModulesQuizNav";
import { CourseTitle, ModulesSidebar } from "./styled";
import { useCourseModules } from "@/context/CourseModulesContext";
import ModuleNav from "./ModuleNav";
import ModulesSurveyNav from "./ModulesSurveyNav";

export default function ModulesSidebarController() {
  const courseModules = useCourseModules()
  const navs = courseModules.modules.map((module) => {
    return (
      <ModuleNav
        module={module}
        key={module.id}
      />
    )
  })
  return (
    <ModulesSidebar>
      <CourseTitle>
        <Typography variant="h6">
          {courseModules.course.title}
        </Typography>
      </CourseTitle>

      {navs}

      <ModulesQuizNav />
      <ModulesSurveyNav />

      <ModulesHelpButton />
    </ModulesSidebar>
  )
}
