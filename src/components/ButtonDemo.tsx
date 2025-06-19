import React from "react";
import { Button } from "@/components/ui/button";
import { Download, Mail, Heart } from "lucide-react";

export function ButtonDemo() {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <h2 className="text-3xl font-bold mb-8 text-center">shadcn/ui Button Components Demo</h2>
      
      <div className="space-y-8">
        {/* Primary Buttons */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Primary Buttons</h3>
          <div className="flex flex-wrap gap-4">
            <Button>Default</Button>
            <Button variant="default" size="sm">Small</Button>
            <Button variant="default" size="lg">Large</Button>
            <Button variant="default" size="icon">
              <Heart className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Secondary Buttons */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Secondary Buttons</h3>
          <div className="flex flex-wrap gap-4">
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
          </div>
        </div>

        {/* Buttons with Icons */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Buttons with Icons</h3>
          <div className="flex flex-wrap gap-4">
            <Button>
              <Mail className="mr-2 h-4 w-4" />
              Email
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
            <Button variant="secondary">
              <Heart className="mr-2 h-4 w-4" />
              Like
            </Button>
          </div>
        </div>

        {/* Destructive Buttons */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Destructive Actions</h3>
          <div className="flex flex-wrap gap-4">
            <Button variant="destructive">Delete</Button>
            <Button variant="destructive" size="sm">Remove</Button>
          </div>
        </div>

        {/* Disabled States */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Disabled States</h3>
          <div className="flex flex-wrap gap-4">
            <Button disabled>Disabled</Button>
            <Button variant="outline" disabled>Disabled Outline</Button>
            <Button variant="secondary" disabled>Disabled Secondary</Button>
          </div>
        </div>
      </div>
    </div>
  );
} 