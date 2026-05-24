'use client';

import { Typography } from "@mui/material";
import ModulesHelpButton from "./ModulesHelpButton";
import ModulesQuizNav from "./ModulesQuizNav";
import { CourseTitle, ModulesSidebar } from "./styled";
import { useCourseModules } from "@/context/courseModulesContext";
import ModuleNav from "./ModuleNav";
import ModulesSurveyNav from "./ModulesSurveyNav";

export default function ModulesSidebarController() {
  const courseModules = useCourseModules()
  const moduleProgresses = courseModules.moduleProgresses.filter((m) => m.moduleId === module.id)
  const navs = courseModules.modules.map((module) => {
    return (
      <ModuleNav
        module={module}
        moduleProgresses={moduleProgresses}
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
