import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
    onImageUpload: (file: File) => Promise<string>;
};

export function BlogFormModal({ blog, isOpen, onOpenChange, onBlogSubmitted, onImageUpload }: BlogFormModalProps) {
    const [formData, setFormData] = useState<Blog>({
        title: "",
        slug: "",
        featureImage: "",
        content: "",
        state: "Unpublished",
    });
    const [isLoading, setIsLoading] = useState(false);

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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (value: string) => {
        setFormData(prev => ({ ...prev, state: value as 'Unpublished' | 'Published' }));
    };

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const imagePath = await onImageUpload(file);
                setFormData(prev => ({ ...prev, featureImage: imagePath }));
            } catch (error) {
                console.error('Failed to upload image:', error);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

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

            if (!response.ok) {
                throw new Error('Failed to save blog');
            }

            onBlogSubmitted();
            onOpenChange(false);
        } catch (error) {
            console.error('Error saving blog:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{blog ? 'Edit Blog' : 'Create New Blog'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <Input
                            name="title"
                            placeholder="Title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                        />
                        <Input
                            name="slug"
                            placeholder="Slug"
                            value={formData.slug}
                            onChange={handleChange}
                            required
                        />
                        <Textarea
                            name="content"
                            placeholder="Content"
                            value={formData.content}
                            onChange={handleChange}
                            required
                        />
                        <div>
                            <Input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                            />
                            {formData.featureImage && (
                                <img
                                    src={formData.featureImage}
                                    alt="Feature"
                                    className="mt-2 w-32 h-32 object-cover rounded"
                                />
                            )}
                        </div>
                        <Select
                            value={formData.state}
                            onValueChange={handleSelectChange}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select state" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Unpublished">Unpublished</SelectItem>
                                <SelectItem value="Published">Published</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Saving...' : 'Save'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}