import { RelatedModule } from "@/types";

export default function areModulesCompleted (modules: RelatedModule[]) {
  const modulesCompleted = modules.every((module) => module.moduleProgresses[0]?.endModule)
  return modulesCompleted
}