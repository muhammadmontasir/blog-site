import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ShowContentModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    content: string;
}

export function ShowContentModal({
    isOpen,
    onOpenChange,
    content,
}: ShowContentModalProps) {
    const handleCopy = () => {
        navigator.clipboard.writeText(content);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                    <DialogTitle>Blog Content</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <Textarea
                        value={content}
                        readOnly
                        className="min-h-[300px]"
                    />
                </div>
                <div className="flex justify-end space-x-2">
                    <Button onClick={handleCopy}>Copy to Clipboard</Button>
                    <DialogClose asChild>
                        <Button variant="outline">Close</Button>
                    </DialogClose>
                </div>
            </DialogContent>
        </Dialog>
    );
}