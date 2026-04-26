import { useCourseModules } from "@/context/courseModulesContext";
import { RelatedModule } from "@/types";
import ModulesNavLabel from "./ModulesNavLabel";
import { SectionItem } from "./styled";

interface ModuleNavProps {
  module: RelatedModule
}

export default function ModuleNav({
  module
}: ModuleNavProps) {
  const courseModules = useCourseModules()
  const previousModule = courseModules.modules.find((m) => m.order === module.order - 1);
  const locked = previousModule
    ? previousModule.moduleProgresses[0]?.endModule == null
    : false
  const completed = module.moduleProgresses[0]?.endModule != null;
  return (
    <SectionItem
      onClick={() => courseModules.selectModule(module.id)}
      isLocked={locked}
      sx={{
        bgcolor:
          courseModules.selectedModuleId === module.id
            ? "action.selected"
            : "transparent",
        pointerEvents: locked ? "none" : "auto",
      }}
    >
      <ModulesNavLabel completed={completed} locked={locked}>
        {module.heading}
      </ModulesNavLabel>
    </SectionItem>
  )
}