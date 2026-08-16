import { useCourseModules } from "@/context/CourseModulesContext";
import { Module, ModuleProgress } from "@/types";
import ModulesNavLabel from "./ModulesNavLabel";
import { SectionItem } from "./styled";

export default function ModuleNav(props: {
  module: Module
}) {
  const courseModules = useCourseModules()
  const previousModule = courseModules.modules.find((m) => {
    return m.order === props.module.order - 1
  });
  const moduleProgress = courseModules.moduleProgresses.find((m) => {
    return m.moduleId === props.module.id
  });
  const locked = previousModule
    ? moduleProgress?.endModule == null
    : false
  const completed = moduleProgress?.endModule != null;
  return (
    <SectionItem
      onClick={() => courseModules.selectModule(props.module.id)}
      isLocked={locked}
      sx={{
        bgcolor:
          courseModules.selectedModuleId === props.module.id
            ? "action.selected"
            : "transparent",
        pointerEvents: locked ? "none" : "auto",
      }}
    >
      <ModulesNavLabel completed={completed} locked={locked}>
        {props.module.heading}
      </ModulesNavLabel>
    </SectionItem>
  )
}