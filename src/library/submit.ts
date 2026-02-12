import emailjs from "@emailjs/browser";
import { SyntheticEvent } from "react";
import {
  emailjsUserId,
  emailjsTemplateId,
  emailjsServiceId,
} from "@/library/config";

const submitForm = (
  e: SyntheticEvent,
  setIsSuccess: React.Dispatch<React.SetStateAction<boolean>>,
): void => {
  e.preventDefault();
  emailjs
    .sendForm(
      emailjsUserId,
      emailjsTemplateId,
      e.target as HTMLFormElement,
      emailjsServiceId,
    )
    .then(
      () => {
        console.log("success");
        setIsSuccess(true);
      },
      (error) => {
        console.log("Error: ", error.text);
        setIsSuccess(false);
      },
    );
};
export default submitForm;
