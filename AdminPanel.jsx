import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Shield, Store, Truck, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function AdminPanel() {
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(u => {
      if (u.role !== 'admin') {
        window.location.href = '/';
      }
      setUser(u);
    }).catch(() => {
      window.location.href = '/';
    });
  }, []);

  const { data: drivers = [] } = useQuery({
    queryKey: ['allDrivers'],
    queryFn: () => base44.entities.Driver.list('-created_date', 100),
  });

  const { data: restaurants = [] } = useQuery({
    queryKey: ['allRestaurants'],
    queryFn: () => base44.entities.Restaurant.list('-created_date', 100),
  });

  const updateDriverMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.Driver.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allDrivers'] });
      toast.success('Estado actualizado');
    }
  });

  const updateRestaurantMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.Restaurant.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allRestaurants'] });
      toast.success('Estado actualizado');
    }
  });

  const statusColors = {
    pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock },
    approved: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
    rejected: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle }
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-5 py-8">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8" />
          <h1 className="text-2xl font-bold">Panel de Administración</h1>
        </div>
      </div>

      <div className="px-5 py-6">
        <Tabs defaultValue="drivers" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="drivers">
              <Truck className="w-4 h-4 mr-2" />
              Repartidores
            </TabsTrigger>
            <TabsTrigger value="restaurants">
              <Store className="w-4 h-4 mr-2" />
              Restaurantes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="drivers" className="space-y-4">
            {drivers.map((driver, index) => {
              const status = statusColors[driver.status || 'pending'];
              const StatusIcon = status.icon;
              
              return (
                <motion.div
                  key={driver.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{driver.full_name}</CardTitle>
                          <p className="text-sm text-gray-500">{driver.phone}</p>
                          <p className="text-sm text-gray-500">{driver.vehicle_type}</p>
                        </div>
                        <Badge className={`${status.bg} ${status.text} border-0`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {driver.status || 'pending'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        {driver.selfie && (
                          <img src={driver.selfie} alt="Selfie" className="w-full h-24 object-cover rounded-lg" />
                        )}
                        {driver.id_front && (
                          <img src={driver.id_front} alt="ID" className="w-full h-24 object-cover rounded-lg" />
                        )}
                      </div>
                      <p className="text-sm"><strong>CURP:</strong> {driver.curp}</p>
                      {(driver.status === 'pending' || driver.status === 'rejected') && (
                        <div className="flex gap-2">
                          <Button
                            onClick={() => updateDriverMutation.mutate({ id: driver.id, status: 'approved' })}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Aprobar
                          </Button>
                          <Button
                            onClick={() => updateDriverMutation.mutate({ id: driver.id, status: 'rejected' })}
                            variant="destructive"
                            className="flex-1"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Rechazar
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </TabsContent>

          <TabsContent value="restaurants" className="space-y-4">
            {restaurants.map((restaurant, index) => {
              const status = statusColors[restaurant.status || 'pending'];
              const StatusIcon = status.icon;
              
              return (
                <motion.div
                  key={restaurant.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{restaurant.name}</CardTitle>
                          <p className="text-sm text-gray-500">{restaurant.category}</p>
                          <p className="text-sm text-gray-500">{restaurant.phone}</p>
                        </div>
                        <Badge className={`${status.bg} ${status.text} border-0`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {restaurant.status || 'pending'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {restaurant.image && (
                        <img src={restaurant.image} alt={restaurant.name} className="w-full h-32 object-cover rounded-lg" />
                      )}
                      <p className="text-sm">{restaurant.description}</p>
                      <p className="text-sm"><strong>Dirección:</strong> {restaurant.address}</p>
                      {(restaurant.status === 'pending' || restaurant.status === 'rejected') && (
                        <div className="flex gap-2">
                          <Button
                            onClick={() => updateRestaurantMutation.mutate({ id: restaurant.id, status: 'approved' })}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Aprobar
                          </Button>
                          <Button
                            onClick={() => updateRestaurantMutation.mutate({ id: restaurant.id, status: 'rejected' })}
                            variant="destructive"
                            className="flex-1"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Rechazar
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
