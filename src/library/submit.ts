import emailjs from "emailjs-com";
import { SyntheticEvent } from "react";

const submitForm = (
  e: SyntheticEvent,
  setIsSuccess: React.Dispatch<React.SetStateAction<boolean>>
): void => {
  e.preventDefault();
  emailjs
    .sendForm(
      "service_96a1ob9",
      "template_rkxspjl",
      e.target as HTMLFormElement,
      "5yswU2LcUAE_fprqr"
    ) //move this to ENV file
    .then(
      () => {
        console.log("success");
        setIsSuccess(true);
      },
      (error) => {
        console.log("Error: ", error.text);
        setIsSuccess(false);
      }
    );
};
export default submitForm;
