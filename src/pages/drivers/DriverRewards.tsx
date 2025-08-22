import { Button } from "../../components/ui/Button";
import {
  Award,
  ChevronDown,
  ChevronUp,
  Clock,
  Gift,
  Search,
  Star,
  Trophy,
  User,
} from "lucide-react";
import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "../../components/ui/Card";

// Mock rewards data
const mockRewards = [
  {
    id: "rew-001",
    driverId: "drv-001",
    driverName: "John Doe",
    points: 1250,
    level: "gold",
    pointsHistory: [
      { date: "2023-10-05", points: 150, reason: "On-time delivery streak (10 days)" },
      { date: "2023-09-22", points: 200, reason: "Fuel efficiency champion - September" },
      { date: "2023-09-15", points: 100, reason: "Perfect vehicle inspection" },
      { date: "2023-09-05", points: 300, reason: "Zero violations - Q3" },
      { date: "2023-08-12", points: 500, reason: "Annual safety award" },
    ],
    redeemed: [
      { date: "2023-07-20", points: 800, reward: "Weekend getaway voucher" },
      { date: "2023-04-15", points: 500, reward: "Fuel card bonus" },
    ],
  },
  {
    id: "rew-002",
    driverId: "drv-002",
    driverName: "Jane Smith",
    points: 950,
    level: "silver",
    pointsHistory: [
      { date: "2023-10-10", points: 100, reason: "Customer commendation" },
      { date: "2023-09-30", points: 150, reason: "On-time delivery streak (7 days)" },
      { date: "2023-09-18", points: 200, reason: "Vehicle cleanliness award" },
      { date: "2023-08-25", points: 500, reason: "Zero incidents - August" },
    ],
    redeemed: [{ date: "2023-08-01", points: 300, reward: "Shopping voucher" }],
  },
  {
    id: "rew-003",
    driverId: "drv-003",
    driverName: "Michael Johnson",
    points: 2200,
    level: "platinum",
    pointsHistory: [
      { date: "2023-10-12", points: 300, reason: "Fuel efficiency champion - October" },
      { date: "2023-09-28", points: 200, reason: "On-time delivery streak (14 days)" },
      { date: "2023-09-15", points: 150, reason: "Customer commendation" },
      { date: "2023-09-01", points: 1000, reason: "Driver of the Quarter - Q3" },
      { date: "2023-08-15", points: 300, reason: "Zero violations - August" },
      { date: "2023-08-05", points: 250, reason: "Training completion" },
    ],
    redeemed: [
      { date: "2023-07-10", points: 1200, reward: "Smartphone" },
      { date: "2023-05-05", points: 500, reward: "Family dinner voucher" },
    ],
  },
  {
    id: "rew-004",
    driverId: "drv-004",
    driverName: "Sarah Williams",
    points: 580,
    level: "bronze",
    pointsHistory: [
      { date: "2023-10-08", points: 100, reason: "Perfect attendance - September" },
      { date: "2023-09-20", points: 150, reason: "Vehicle cleanliness award" },
      { date: "2023-09-05", points: 80, reason: "Customer commendation" },
      { date: "2023-08-22", points: 250, reason: "Training completion" },
    ],
    redeemed: [],
  },
  {
    id: "rew-005",
    driverId: "drv-005",
    driverName: "Robert Brown",
    points: 820,
    level: "silver",
    pointsHistory: [
      { date: "2023-10-10", points: 200, reason: "Zero violations - Q3" },
      { date: "2023-09-25", points: 120, reason: "Perfect vehicle inspection" },
      { date: "2023-09-10", points: 150, reason: "On-time delivery streak (5 days)" },
      { date: "2023-08-30", points: 350, reason: "Fuel efficiency improvement" },
    ],
    redeemed: [{ date: "2023-08-10", points: 300, reward: "Shopping voucher" }],
  },
];

// Available rewards
const availableRewards = [
  {
    id: "reward-001",
    name: "Shopping Voucher",
    points: 300,
    description: "GH₵200 shopping voucher for selected stores",
    stock: 10,
  },
  {
    id: "reward-002",
    name: "Fuel Card Bonus",
    points: 500,
    description: "GH₵350 credit on company fuel card",
    stock: 5,
  },
  {
    id: "reward-003",
    name: "Family Dinner Voucher",
    points: 500,
    description: "Dinner for 4 at selected restaurants",
    stock: 8,
  },
  {
    id: "reward-004",
    name: "Weekend Getaway",
    points: 1000,
    description: "2-night stay at selected hotels",
    stock: 3,
  },
  {
    id: "reward-005",
    name: "Smartphone",
    points: 1200,
    description: "Mid-range smartphone",
    stock: 2,
  },
  {
    id: "reward-006",
    name: "Premium Watch",
    points: 1500,
    description: "Quality timepiece",
    stock: 2,
  },
  {
    id: "reward-007",
    name: "Annual Leave Bonus",
    points: 2000,
    description: "2 extra days of annual leave",
    stock: "Unlimited",
  },
  {
    id: "reward-008",
    name: "Flight Tickets",
    points: 3000,
    description: "Return tickets to selected destinations",
    stock: 1,
  },
];

const DriverRewards: React.FC = () => {
  const [rewards] = useState(mockRewards);
  const [expandedDriver, setExpandedDriver] = useState<string | null>(null);

  // Toggle expanded driver
  const toggleDriverExpand = (driverId: string) => {
    if (expandedDriver === driverId) {
      setExpandedDriver(null);
    } else {
      setExpandedDriver(driverId);
    }
  };

  // Function to get badge for level
  const getLevelBadge = (level: string) => {
    switch (level) {
      case "bronze":
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-amber-100 text-amber-800">Bronze</span>
        );
      case "silver":
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-gray-200 text-gray-800">Silver</span>
        );
      case "gold":
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Gold</span>
        );
      case "platinum":
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">Platinum</span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">{level}</span>
        );
    }
  };

  // Function to render stars based on level
  const renderStars = (level: string) => {
    let stars = 0;

    switch (level) {
      case "bronze":
        stars = 1;
        break;
      case "silver":
        stars = 2;
        break;
      case "gold":
        stars = 3;
        break;
      case "platinum":
        stars = 4;
        break;
      default:
        stars = 0;
    }

    return (
      <div className="flex">
        {[...Array(stars)].map((_, i) => (
          <Star key={i} className="h-4 w-4 text-yellow-500 fill-yellow-500" />
        ))}
        {[...Array(4 - stars)].map((_, i) => (
          <Star key={i + stars} className="h-4 w-4 text-gray-300" />
        ))}
      </div>
    );
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Driver Rewards Program</h1>

        <Button variant="outline" onClick={() => alert("Open the rewards program settings")}>
          Program Settings
        </Button>
      </div>

      {/* Top Performers */}
      <Card>
        <CardHeader title="Top Performers" />
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...rewards]
              .sort((a, b) => b.points - a.points)
              .slice(0, 3)
              .map((reward, index) => (
                <div
                  key={reward.id}
                  className={`border rounded-md overflow-hidden ${
                    index === 0
                      ? "border-yellow-300"
                      : index === 1
                        ? "border-gray-300"
                        : "border-amber-600"
                  }`}
                >
                  <div
                    className={`p-4 flex items-center justify-center ${
                      index === 0 ? "bg-yellow-50" : index === 1 ? "bg-gray-50" : "bg-amber-50"
                    }`}
                  >
                    <div className="text-center">
                      <div className="flex justify-center mb-2">
                        {index === 0 ? (
                          <Trophy className="h-8 w-8 text-yellow-500" />
                        ) : index === 1 ? (
                          <Trophy className="h-8 w-8 text-gray-500" />
                        ) : (
                          <Trophy className="h-8 w-8 text-amber-600" />
                        )}
                      </div>
                      <div className="text-sm font-medium mb-1">{`#${index + 1} - ${reward.driverName}`}</div>
                      <div className="flex justify-center">{renderStars(reward.level)}</div>
                    </div>
                  </div>

                  <div className="p-4 text-center">
                    <div className="text-2xl font-bold text-gray-900">{reward.points} pts</div>
                    <div className="text-xs text-gray-500 mt-1">Current balance</div>

                    <div className="mt-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setExpandedDriver(reward.driverId)}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Driver Rewards Summary */}
      <Card>
        <CardHeader title="Driver Rewards Summary" />
        <CardContent>
          <div className="mb-4 flex items-center justify-between">
            <div className="relative w-full md:w-64">
              <input
                type="text"
                placeholder="Search drivers..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
          </div>

          <div className="space-y-4">
            {rewards.map((reward) => (
              <div key={reward.id} className="border rounded-md overflow-hidden">
                <div
                  className="p-4 flex items-center justify-between cursor-pointer"
                  onClick={() => toggleDriverExpand(reward.driverId)}
                >
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="h-6 w-6 text-gray-500" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{reward.driverName}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        {getLevelBadge(reward.level)}
                        <span className="text-sm text-gray-600">{reward.points} points</span>
                      </div>
                    </div>
                  </div>

                  {expandedDriver === reward.driverId ? (
                    <ChevronUp className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  )}
                </div>

                {expandedDriver === reward.driverId && (
                  <div className="border-t px-4 py-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-3">
                          Recent Points Earned
                        </h4>
                        <div className="space-y-2">
                          {reward.pointsHistory.slice(0, 5).map((history, index) => (
                            <div key={`history-${index}`} className="flex items-start space-x-2">
                              <div className="bg-green-100 p-1 rounded-full mt-1">
                                <Award className="h-3 w-3 text-green-600" />
                              </div>
                              <div className="flex-1">
                                <div className="flex justify-between items-start">
                                  <div className="text-sm text-gray-900">{history.reason}</div>
                                  <div className="text-sm font-medium text-green-600">
                                    +{history.points}
                                  </div>
                                </div>
                                <div className="text-xs text-gray-500">
                                  {formatDate(history.date)}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-3">Rewards Redeemed</h4>
                        {reward.redeemed.length > 0 ? (
                          <div className="space-y-2">
                            {reward.redeemed.map((redeemed, index) => (
                              <div key={`redeemed-${index}`} className="flex items-start space-x-2">
                                <div className="bg-blue-100 p-1 rounded-full mt-1">
                                  <Gift className="h-3 w-3 text-blue-600" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex justify-between items-start">
                                    <div className="text-sm text-gray-900">{redeemed.reward}</div>
                                    <div className="text-sm font-medium text-gray-600">
                                      -{redeemed.points}
                                    </div>
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {formatDate(redeemed.date)}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500 py-2">No rewards redeemed yet</div>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => alert(`Add points for ${reward.driverName}`)}
                      >
                        Add Points
                      </Button>

                      <Button
                        size="sm"
                        onClick={() => alert(`Redeem rewards for ${reward.driverName}`)}
                      >
                        Redeem Rewards
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Available Rewards */}
      <Card>
        <CardHeader title="Available Rewards" />
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {availableRewards.map((reward) => (
              <div key={reward.id} className="border rounded-md overflow-hidden">
                <div className="bg-gray-50 p-3 border-b">
                  <h3 className="text-sm font-medium text-gray-900">{reward.name}</h3>
                </div>

                <div className="p-4">
                  <div className="text-xl font-bold text-blue-600 mb-2">{reward.points} pts</div>
                  <p className="text-sm text-gray-600 mb-3">{reward.description}</p>

                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>
                        {typeof reward.stock === "number"
                          ? `${reward.stock} available`
                          : reward.stock}
                      </span>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => alert(`View ${reward.name} details`)}
                    >
                      Details
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Program Rules */}
      <Card>
        <CardHeader title="Program Rules & Levels" />
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 border rounded-md bg-amber-50 border-amber-200">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-medium text-gray-900">Bronze Level</h3>
                <Star className="h-5 w-5 text-amber-600 fill-amber-600" />
              </div>
              <p className="text-sm text-gray-600 mb-2">Entry level for all drivers</p>
              <p className="text-xs text-gray-500">0 - 750 points</p>
              <div className="mt-3 text-xs text-amber-800">Basic rewards access</div>
            </div>

            <div className="p-4 border rounded-md bg-gray-50 border-gray-300">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-medium text-gray-900">Silver Level</h3>
                <div className="flex">
                  <Star className="h-5 w-5 text-gray-500 fill-gray-500" />
                  <Star className="h-5 w-5 text-gray-500 fill-gray-500" />
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-2">Improved performance tier</p>
              <p className="text-xs text-gray-500">751 - 1500 points</p>
              <div className="mt-3 text-xs text-gray-800">Expanded reward options</div>
            </div>

            <div className="p-4 border rounded-md bg-yellow-50 border-yellow-300">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-medium text-gray-900">Gold Level</h3>
                <div className="flex">
                  <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                  <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                  <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-2">Excellence tier</p>
              <p className="text-xs text-gray-500">1501 - 2500 points</p>
              <div className="mt-3 text-xs text-yellow-800">Premium rewards + 10% bonus</div>
            </div>

            <div className="p-4 border rounded-md bg-blue-50 border-blue-200">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-medium text-gray-900">Platinum Level</h3>
                <div className="flex">
                  <Star className="h-5 w-5 text-blue-500 fill-blue-500" />
                  <Star className="h-5 w-5 text-blue-500 fill-blue-500" />
                  <Star className="h-5 w-5 text-blue-500 fill-blue-500" />
                  <Star className="h-5 w-5 text-blue-500 fill-blue-500" />
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-2">Elite performers only</p>
              <p className="text-xs text-gray-500">2501+ points</p>
              <div className="mt-3 text-xs text-blue-800">All rewards + 20% bonus + exclusives</div>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="font-medium text-gray-900 mb-3">How to Earn Points</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-3 bg-gray-50 rounded-md">
                <div className="font-medium text-gray-900 mb-1">Safety Performance</div>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Zero violations (monthly): 150 points</li>
                  <li>• Perfect vehicle inspection: 100 points</li>
                  <li>• Zero incidents (quarterly): 300 points</li>
                </ul>
              </div>

              <div className="p-3 bg-gray-50 rounded-md">
                <div className="font-medium text-gray-900 mb-1">On-Time Delivery</div>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• 5 day streak: 150 points</li>
                  <li>• 10 day streak: 150 points</li>
                  <li>• Perfect month: 300 points</li>
                </ul>
              </div>

              <div className="p-3 bg-gray-50 rounded-md">
                <div className="font-medium text-gray-900 mb-1">Fuel Efficiency</div>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Monthly champion: 200 points</li>
                  <li>• 10% improvement: 150 points</li>
                  <li>• Consistent efficiency: 100 points</li>
                </ul>
              </div>

              <div className="p-3 bg-gray-50 rounded-md">
                <div className="font-medium text-gray-900 mb-1">Customer Satisfaction</div>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Positive feedback: 100 points</li>
                  <li>• Customer commendation: 150 points</li>
                  <li>• Excellence award: 200 points</li>
                </ul>
              </div>

              <div className="p-3 bg-gray-50 rounded-md">
                <div className="font-medium text-gray-900 mb-1">Training & Development</div>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Course completion: 250 points</li>
                  <li>• Certification: 350 points</li>
                  <li>• Knowledge sharing: 150 points</li>
                </ul>
              </div>

              <div className="p-3 bg-gray-50 rounded-md">
                <div className="font-medium text-gray-900 mb-1">Special Awards</div>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Driver of the Month: 500 points</li>
                  <li>• Driver of the Quarter: 1000 points</li>
                  <li>• Annual safety award: 1500 points</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DriverRewards;
