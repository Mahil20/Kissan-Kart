
import { Leaf, Users, MapPin, BadgeCheck, ShoppingBag, Heart } from 'lucide-react';

const FeaturesSection = () => {
  const features = [
    {
      icon: <Leaf className="h-8 w-8 text-primary" />,
      title: "Fresh & Local",
      description: "Get access to the freshest produce directly from local farmers without middlemen."
    },
    {
      icon: <MapPin className="h-8 w-8 text-primary" />,
      title: "Find Nearby",
      description: "Easily locate farmers near you using our interactive map and PIN code search."
    },
    {
      icon: <BadgeCheck className="h-8 w-8 text-primary" />,
      title: "Verified Vendors",
      description: "All farmers are verified through our thorough process to ensure authenticity."
    },
    {
      icon: <ShoppingBag className="h-8 w-8 text-primary" />,
      title: "Seasonal Produce",
      description: "Discover what's in season and support sustainable agricultural practices."
    },
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: "Support Farmers",
      description: "Directly support local Indian farmers and their families with your purchases."
    },
    {
      icon: <Heart className="h-8 w-8 text-primary" />,
      title: "Save Favorites",
      description: "Create a list of your favorite farmers for quick access next time you shop."
    }
  ];

  return (
    <section className="py-16 bg-green-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose KisanKart</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover the benefits of connecting directly with local farmers through our platform
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="h-14 w-14 bg-green-50 rounded-full flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
