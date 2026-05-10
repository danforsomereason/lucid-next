import { Module, ModuleProgress } from "@/types";

export default function areModulesCompleted (
  modules: Module[],
  moduleProgresses: ModuleProgress[]
) {
  const modulesCompleted = modules.every((module) => {
    const moduleProgress = moduleProgresses.find((m) => m.moduleId === module.id)
    return moduleProgress?.endModule != null
  })
  return modulesCompleted
}