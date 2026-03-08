import { Typography } from "@mui/material";
import { SectionItem } from "./styled";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import { RelatedModule } from "@/types";
import { useCourseModules } from "@/context/courseModulesContext";

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
      {completed ? (
        <CheckCircleIcon color="success" />
      ) : locked ? (
        <CancelIcon color="disabled" />
      ) : (
        <CheckCircleIcon color="disabled" />
      )}
      <Typography
        color={
          locked ? "text.disabled" : "text.primary"
        }
      >
        {module.heading}
      </Typography>
    </SectionItem>
  )
}