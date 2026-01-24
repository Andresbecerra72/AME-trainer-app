"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useTransition } from "react";
import { updateQuestionStatusAction } from "../services/question.server";
import { questionKeys } from "../hooks/use-questions";
import { useToast } from "@/hooks/use-toast";

interface StatusUpdateButtonProps {
  questionId: string;
  status: "approved" | "rejected" | "pending";
  currentStatus: string;
  variant?: "approve" | "reject";
}

export function StatusUpdateButton({ 
  questionId, 
  status, 
  currentStatus,
  variant = "approve" 
}: StatusUpdateButtonProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  // Don't show button if status matches current
  if (currentStatus === status) {
    return null;
  }

  const handleUpdate = () => {
    startTransition(async () => {
      try {
        await updateQuestionStatusAction(questionId, status);
        
        // Invalidate queries to refresh the list
        queryClient.invalidateQueries({ queryKey: questionKeys.lists() });
        
        toast({
          title: "Status updated",
          description: `Question ${status === "approved" ? "approved" : "rejected"} successfully`,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to update question status",
          variant: "destructive",
        });
      }
    });
  };

  if (variant === "approve") {
    return (
      <Button 
        onClick={handleUpdate}
        disabled={isPending}
        size="sm" 
        className="w-full bg-green-600 hover:bg-green-700 h-8 text-xs"
      >
        <CheckCircle className="h-3 w-3 mr-1" />
        {isPending ? "Approving..." : "Approve"}
      </Button>
    );
  }

  return (
    <Button 
      onClick={handleUpdate}
      disabled={isPending}
      size="sm" 
      variant="destructive"
      className="w-full h-8 text-xs"
    >
      <XCircle className="h-3 w-3 mr-1" />
      {isPending ? "Rejecting..." : "Reject"}
    </Button>
  );
}
