import { HelpButton } from "./styled";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";

export default function ModulesHelpButton() {
  return (
    <HelpButton
      variant="contained"
      color="primary"
      startIcon={<HelpOutlineIcon />}
      onClick={() => {
        alert(
          "Course Instructions:\n\n" +
          "1. Read through each module carefully\n" +
          "2. Complete modules in order - they unlock sequentially\n" +
          "3. Click 'NEXT' at the bottom of each section\n" +
          "4. After finishing all modules, take the course quiz\n" +
          "5. Pass the quiz to receive your certificate\n\n" +
          "Need more help? Contact support@lucidceu.com"
        );
      }}
    >
      HELP
    </HelpButton>
  )
}