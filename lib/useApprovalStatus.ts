
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export function useApprovalStatus(userId: string | null) {
  const [canInteract, setCanInteract] = useState(false);
  const [approvalLoaded, setApprovalLoaded] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadApproval() {
      setApprovalLoaded(false);
      setCanInteract(false);

      if (!userId) {
        setApprovalLoaded(true);
        return;
      }

      const { data, error } = await supabase
        .from("usuarios")
        .select("puede_interactuar")
        .eq("id", userId)
        .maybeSingle();

      if (!active) return;

      if (error) {
        console.error("Error loading approval status:", error);
        setCanInteract(false);
      } else {
        setCanInteract(data?.puede_interactuar === true);
      }

      setApprovalLoaded(true);
    }

    void loadApproval();

    return () => {
      active = false;
    };
  }, [userId]);

  return { canInteract, approvalLoaded };
}
