import { Button } from "./components/ui/Button";
import Input from "./components/ui/Input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "./components/ui/Card";

export default function Home() {
  return (
    <div className="p-8 space-y-8 max-w-2xl mx-auto">
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Button Variants</h2>
        <div className="flex flex-wrap gap-4">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Button Sizes</h2>
        <div className="flex flex-wrap items-center gap-4">
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Button States</h2>
        <div className="flex flex-wrap gap-4">
          <Button loading>Loading</Button>
          <Button disabled>Disabled</Button>
          <Button loading disabled>
            Loading & Disabled
          </Button>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Combinations</h2>
        <div className="flex flex-wrap gap-4">
          <Button variant="primary" size="lg">
            Large Primary
          </Button>
          <Button variant="destructive" size="sm">
            Small Destructive
          </Button>
          <Button variant="outline" size="lg" loading>
            Large Outline Loading
          </Button>
          <Button variant="ghost" size="sm" disabled>
            Small Ghost Disabled
          </Button>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Input Components</h2>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Basic Inputs</h3>
          <Input label="Username" placeholder="Enter your username" />
          <Input label="Email" type="email" placeholder="your@email.com" />
          <Input label="Password" type="password" placeholder="••••••••" />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Input States</h3>
          <Input
            label="Disabled Input"
            disabled
            placeholder="Can't edit this"
          />
          <Input
            label="Error State"
            placeholder="Something went wrong"
            error="This field is required"
          />
          <Input
            label="With Helper Text"
            placeholder="Additional information"
            helperText="This text will help the user"
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Without Labels</h3>
          <Input placeholder="Search..." className="w-full" />
          <Input placeholder="Enter value" error="Invalid input" />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Combined with Buttons</h3>
          <div className="flex gap-2">
            <Input placeholder="Enter promo code" className="flex-1" />
            <Button variant="primary">Apply</Button>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Card Components</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Card */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Card</CardTitle>
              <CardDescription>This is a simple card example</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                This is the content area of the card. You can put any content
                here.
              </p>
            </CardContent>
          </Card>

          {/* Card with Footer Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Card with Actions</CardTitle>
              <CardDescription>Includes footer with buttons</CardDescription>
            </CardHeader>
            <CardContent>
              <Input label="Email" placeholder="your@email.com" />
            </CardContent>
            <CardFooter className="justify-end gap-2">
              <Button variant="outline">Cancel</Button>
              <Button variant="primary">Submit</Button>
            </CardFooter>
          </Card>

          {/* Card with Image */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Featured Content</CardTitle>
              <CardDescription>Card spanning two columns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-6">
                <img
                  src="https://via.placeholder.com/300x200"
                  alt="Placeholder"
                  className="rounded-md w-full md:w-1/3"
                />
                <div className="space-y-4">
                  <h4 className="font-medium text-lg">Card with Image</h4>
                  <p className="text-gray-700">
                    This card demonstrates how you can include images alongside
                    other content. The layout is responsive and adjusts for
                    different screen sizes.
                  </p>
                  <Button variant="ghost">Learn More →</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Card */}
          <Card>
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-500">Total Users</span>
                <span className="font-medium">1,234</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Active Now</span>
                <span className="font-medium">567</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Conversion</span>
                <span className="font-medium">12.5%</span>
              </div>
            </CardContent>
          </Card>

          {/* Alert Card */}
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-700">Important Notice</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-600">
                This is an alert-style card. You can customize the colors and
                content to display important warnings or notifications.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="destructive" size="sm">
                Acknowledge
              </Button>
            </CardFooter>
          </Card>
        </div>
      </section>
    </div>
  );
}
