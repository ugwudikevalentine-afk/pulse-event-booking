import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, formatCurrency } from "@/lib/utils";

interface EventCardProps {
  id: string;
  slug: string;
  title: string;
  category: string;
  venue: string;
  city: string;
  startDate: string;
  image: string | null;
  lowestPrice: number | null;
}

const categoryColors: Record<string, string> = {
  CONCERT: "bg-purple-100 text-purple-800",
  SPORTS: "bg-green-100 text-green-800",
  CONFERENCE: "bg-blue-100 text-blue-800",
  FESTIVAL: "bg-orange-100 text-orange-800",
  THEATER: "bg-red-100 text-red-800",
  WORKSHOP: "bg-yellow-100 text-yellow-800",
  OTHER: "bg-gray-100 text-gray-800",
};

export function EventCard({ slug, title, category, venue, city, startDate, image, lowestPrice }: EventCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-video bg-muted relative overflow-hidden">
        {image ? (
          <img src={image} alt={title} className="object-cover w-full h-full" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
            No image
          </div>
        )}
        <Badge className={`absolute top-3 left-3 ${categoryColors[category] || categoryColors.OTHER}`}>
          {category}
        </Badge>
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg leading-tight mb-1 line-clamp-2">{title}</h3>
        <p className="text-sm text-muted-foreground">{venue}, {city}</p>
        <p className="text-sm text-muted-foreground mt-1">{formatDate(startDate)}</p>
      </CardContent>
      <CardFooter className="px-4 pb-4 flex items-center justify-between">
        <span className="text-sm font-medium">
          {lowestPrice ? `From ${formatCurrency(lowestPrice)}` : "Free"}
        </span>
        <Link href={`/events/${slug}`}>
          <Button size="sm">View Details</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}