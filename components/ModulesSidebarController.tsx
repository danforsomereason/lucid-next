'use client';

import { Typography } from "@mui/material";
import ModulesHelpButton from "./ModulesHelpButton";
import ModulesQuizNav from "./ModulesQuizNav";
import { CourseTitle, ModulesSidebar } from "./styled";
import { useCourseModules } from "@/context/courseModulesContext";
import ModuleNav from "./ModuleNav";

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

      <ModulesQuizNav
        modulesCompleted={courseModules.modulesCompleted}
        quizCompleted={courseModules.quizCompleted}
      />

      <ModulesHelpButton />
    </ModulesSidebar>
  )
}
