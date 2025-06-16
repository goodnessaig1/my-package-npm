import React from "react";
import "./Registration.css";
import { IEventData } from "../GruveEventsWidget";
interface RegistrationProps {
    handleCloseModal: () => void;
    setOpenRegistration: (value: boolean) => void;
    setShowRegistrationSuccess: (value: boolean) => void;
    setUserEmail: (value: string) => void;
    eventData: IEventData | null;
    creator: string | undefined;
    address: string | undefined;
    isTest: boolean;
}
declare const Registration: React.FC<RegistrationProps>;
export default Registration;
