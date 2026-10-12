// import { useNavigate } from "react-router-dom"
// import { useDispatch, useSelector } from "react-redux"

// import type { AppDispatch } from "@/app/store"

// import TempleForm from "../components/TempleForm"

// import { createTemple } from "../templeThunks"
// import { selectTempleSaving } from "../templeSelectors"

// import type { TempleFormData } from "../templeTypes"

// export default function AddTemple() {
//   const navigate = useNavigate()

//   const dispatch = useDispatch<AppDispatch>()

//   const loading = useSelector(selectTempleSaving)

//   const handleSubmit = async (
//     data: TempleFormData,
//   ) => {
//     console.log(
//       "================================",
//     )

//     console.log(
//       "TEMPLE CREATE SUBMIT:",
//       data,
//     )

//     try {
//       const result = await dispatch(
//         createTemple(data),
//       ).unwrap()

//       console.log(
//         "TEMPLE CREATED:",
//         result,
//       )

//       navigate("/temples")
//     } catch (error) {
//       console.error(
//         "TEMPLE CREATE FAILED:",
//         error,
//       )
//     }
//   }

//   return (
//     <div className="space-y-6">
//       <TempleForm
//         loading={loading}
//         onSubmit={handleSubmit}
//         onCancel={() =>
//           navigate("/temples")
//         }
//       />
//     </div>
//   )
// }


import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AlertCircle } from "lucide-react";
import type { AppDispatch } from "@/app/store";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import TempleForm from "../components/TempleForm";
import { createTemple } from "../templeThunks";
import { selectTempleSaving } from "../templeSelectors";
import type { TempleFormData } from "../templeTypes";

export default function AddTemple() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const loading = useSelector(selectTempleSaving);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: TempleFormData) => {
    setError(null);

    try {
      await dispatch(createTemple(data)).unwrap();
      navigate("/temples");
    } catch (err: unknown) {
      setError(
        typeof err === "string"
          ? err
          : "Failed to create temple. Please try again.",
      );
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* {error && (
        <div
          role="alert"
          aria-live="polite"
          className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          <p className="font-semibold">Unable to create temple</p>
          <p className="mt-1">{error}</p>
        </div>
      )} */}
       {error && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />

          <AlertTitle>Unable to Create Templey</AlertTitle>
          <AlertDescription>{error}</AlertDescription>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => setError("")}
          >
            Dismiss
          </Button>
        </Alert>
      )}

      <TempleForm
        loading={loading}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/temples")}
      />
    </div>
  );
}
