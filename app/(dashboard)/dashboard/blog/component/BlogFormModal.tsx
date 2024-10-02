import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Blog = {
    id?: string;
    title: string;
    slug: string;
    featureImage: string;
    content: string;
    state: 'Unpublished' | 'Published';
};

type BlogFormModalProps = {
    blog?: Blog | null;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onBlogSubmitted: () => void;
};

export function BlogFormModal({ blog, isOpen, onOpenChange, onBlogSubmitted }: BlogFormModalProps) {
    const [formData, setFormData] = useState<Blog>({
        title: "",
        slug: "",
        featureImage: "",
        content: "",
        state: "Unpublished",
    });

    useEffect(() => {
        if (blog) {
            setFormData(blog);
        } else {
            setFormData({
                title: "",
                slug: "",
                featureImage: "",
                content: "",
                state: "Unpublished",
            });
        }
    }, [blog]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = blog ? `/api/blogs/${blog.id}` : '/api/blogs';
            const method = blog ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.error || `Failed to ${blog ? 'update' : 'add'} blog post`);
            }
            onOpenChange(false);
            onBlogSubmitted();
        } catch (error: any) {
            console.error(`Failed to ${blog ? 'update' : 'add'} blog post:`, error);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{blog ? 'Edit' : 'Add New'} Blog Post</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="title" className="text-right">
                                Title
                            </Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="slug" className="text-right">
                                Slug
                            </Label>
                            <Input
                                id="slug"
                                value={formData.slug}
                                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="featureImage" className="text-right">
                                Feature Image URL
                            </Label>
                            <Input
                                id="featureImage"
                                value={formData.featureImage}
                                onChange={(e) => setFormData({ ...formData, featureImage: e.target.value })}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="content" className="text-right">
                                Content
                            </Label>
                            <Textarea
                                id="content"
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="state" className="text-right">
                                State
                            </Label>
                            <select
                                id="state"
                                value={formData.state}
                                onChange={(e) => setFormData({ ...formData, state: e.target.value as 'Unpublished' | 'Published' })}
                                className="col-span-3"
                            >
                                <option value="Unpublished">Unpublished</option>
                                <option value="Published">Published</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <Button type="submit">{blog ? 'Update' : 'Add'} Blog Post</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}