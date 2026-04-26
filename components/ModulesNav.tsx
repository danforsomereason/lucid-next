import { ReactNode } from "react";
import ModulesNavLabel from "./ModulesNavLabel";
import { SectionItem } from "./styled";

interface ModulesNavProps {
  children: ReactNode
  completed: boolean
  current: number
  icon: ReactNode
  locked: boolean
  onClick: () => void
  total: number
}

export default function ModulesNav({
  children, completed, current, icon, locked, onClick, total
}: ModulesNavProps) {
  return (
    <SectionItem
      onClick={onClick}
      sx={{
        borderTop: 1,
        borderColor: "divider",
        opacity:
          completed ? 1 : 0.5,
        pointerEvents: locked ? "none" : "auto",
      }}
    >
      <ModulesNavLabel completed={completed} locked={locked}>

        {children}
        {' '}
        {!completed && (
          <>
            (
            {current}
            /
            {total}
            )
          </>
        )}
      </ModulesNavLabel>
      {icon}
    </SectionItem>
  )
}