import { useEffect } from "react";
import { useFormikContext } from "formik";

const ClearErrorOnAnyChange = ({ clearError }: { clearError: () => void }) => {
  const { values } = useFormikContext<any>();

  useEffect(() => {
    clearError();
  }, [values]);

  return null;
};
export default ClearErrorOnAnyChange;
