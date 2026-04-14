import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { 
  Gift, Coins, RefreshCw, Star, MapPin, Package, 
  Truck, CheckCircle, Clock, BadgeCheck 
} from "lucide-react";
import { palette } from "@/theme/palette";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

// Tracking stages
const trackingSteps = [
  "Processing",
  "Shipped",
  "Out for Delivery",
  "Delivered",
];

const StorePage = () => {

  const [items, setItems] = useState<any[]>([]);
  const [xp, setXp] = useState(0);
  const [loading, setLoading] = useState(true);

  const [redemptions, setRedemptions] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  const [redeeming, setRedeeming] = useState<string | null>(null);

  const [showAddressDialog, setShowAddressDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const [showSuccess, setShowSuccess] = useState(false);
  const [trackingInfo, setTrackingInfo] = useState<any>(null);

  const { toast } = useToast();

  const [address, setAddress] = useState({
    fullName: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    phone: ""
  });

  const fetchStore = async () => {
    try {
      const { data } = await axios.get("/api/store", {
        withCredentials: true,
      });
      setItems(data.items);
      setXp(data.userXP);
    } catch (err) {
      console.error("Store fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRedemptions = async () => {
    try {
      const { data } = await axios.get(
        "/api/store/redemptions",
        { withCredentials: true }
      );
      setRedemptions(data.redemptions || []);
    } catch (err) {
      console.error("Redemptions fetch error:", err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleRedeem = (item: any) => {
    setSelectedItem(item);
    setShowAddressDialog(true);
  };

  const processRedeem = async (itemId: string, shippingAddress: any) => {
    try {
      setRedeeming(itemId);
      
      const { data } = await axios.post(
        "/api/store/redeem",
        { itemId, shippingAddress },
        { withCredentials: true }
      );

      setShowAddressDialog(false);
      setShowSuccess(true);
      setTrackingInfo(data.trackingInfo);
      setXp(data.remainingXP);

      toast({
        title: "Mission Accomplished!",
        description: `Your ${selectedItem?.name} is being prepared for dispatch.`,
      });

      fetchStore();
      fetchRedemptions();
    } catch (err: any) {
      toast({
        title: "Redemption Failed",
        description: err.response?.data?.message || "Verify your XP balance and try again.",
        variant: "destructive",
      });
    } finally {
      setRedeeming(null);
    }
  };

  const handleAddressSubmit = () => {
    if (!address.fullName || !address.street || !address.city || !address.zipCode) {
      toast({
        title: "Incomplete Directives",
        description: "Shipping parameters must be fully defined.",
        variant: "destructive"
      });
      return;
    }
    processRedeem(selectedItem._id, address);
  };

  useEffect(() => {
    fetchStore();
    fetchRedemptions();
  }, []);

  const autoUpdateStatus = (r: any) => {
    const created = new Date(r.createdAt);
    const now = new Date();
    const diff = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
    let stage = 0;
    if (diff >= 1) stage = 1;
    if (diff >= 2) stage = 2;
    if (diff >= 3) stage = 3;
    return trackingSteps[stage];
  };

  if (loading)
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center gap-6">
        <div className="w-12 h-12 rounded-full border-4 border-slate-100 border-t-[#1E4D3B] animate-spin" />
        <p className="text-[#1E4D3B] font-black uppercase tracking-widest text-[10px]">Loading Armory...</p>
      </div>
    );

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 space-y-12 max-w-7xl mx-auto">

      {/* HEADER HERO */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="text-left space-y-4">
        <div className="flex items-center gap-4">
           <div className="p-3 rounded-2xl bg-[#1E4D3B] text-white shadow-xl shadow-emerald-900/20">
              <Gift size={32} />
           </div>
           <div>
              <h1 className="text-4xl font-black text-black uppercase tracking-tighter">Student Armory</h1>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Convert Mastery Points to Physical Rewards</p>
           </div>
        </div>
      </motion.div>

      {/* XP HUB */}
      <Card className="rounded-[32px] overflow-hidden border-slate-100 shadow-2xl bg-black text-white group">
         <div className="h-2 w-full bg-[#1E4D3B]" />
         <CardContent className="p-8 flex flex-col sm:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-6">
               <div className="w-16 h-16 rounded-[24px] bg-[#1E4D3B]/20 flex items-center justify-center border border-[#1E4D3B]/30">
                  <Coins className="w-8 h-8 text-[#1E4D3B] animate-pulse" />
               </div>
               <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1E4D3B] mb-1">Available Balance</p>
                  <h2 className="text-4xl font-black tracking-tight">{xp.toLocaleString()} <span className="text-sm font-bold text-slate-500">XP</span></h2>
               </div>
            </div>
            <div className="flex items-center gap-4 w-full sm:w-auto">
               <Button onClick={fetchStore} variant="outline" className="h-14 px-8 rounded-2xl border-white/10 hover:bg-white/5 font-black uppercase tracking-widest text-[10px] text-white flex-1 sm:flex-initial">
                 <RefreshCw className="w-4 h-4 mr-2" /> Sync Credits
               </Button>
               <Button className="h-14 px-10 rounded-2xl bg-[#1E4D3B] hover:bg-white hover:text-black font-black uppercase tracking-widest text-[10px] text-white transition-all flex-1 sm:flex-initial shadow-xl shadow-emerald-900/20">
                 Earn More
               </Button>
            </div>
         </CardContent>
      </Card>

      {/* STORE GRID */}
      <div className="space-y-8">
         <div className="flex items-center justify-between px-2">
            <h2 className="text-2xl font-black text-black uppercase tracking-tight flex items-center gap-3">
               <Star className="text-[#1E4D3B]" size={24} /> Elite Gear
            </h2>
            <div className="h-[2px] flex-1 mx-8 bg-slate-50 hidden md:block" />
            <BadgeCheck className="text-slate-200 hidden md:block" size={24} />
         </div>

         <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
           {items.map((item, index) => (
             <motion.div key={item._id} initial={{ opacity: 0, y: 25 }}
               animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
               
               <Card className="rounded-[32px] overflow-hidden border-slate-100 bg-white hover:shadow-3xl hover:-translate-y-2 transition-all duration-500 group cursor-pointer h-full flex flex-col">
                 <div className="relative aspect-square overflow-hidden bg-slate-50">
                   <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
                      <p className="text-[10px] text-white/80 font-bold uppercase tracking-widest leading-relaxed">{item.description}</p>
                   </div>
                   <div className="absolute top-4 right-4 pt-1">
                      <span className="bg-black text-white text-[9px] font-black px-4 py-2 rounded-xl uppercase tracking-widest shadow-2xl">{item.category}</span>
                   </div>
                 </div>

                 <CardContent className="p-8 space-y-6 flex-1 flex flex-col">
                   <div className="flex-1">
                      <h3 className="text-xl font-black text-black uppercase tracking-tight group-hover:text-[#1E4D3B] transition-colors">{item.name}</h3>
                      <div className="flex items-center gap-2 mt-2">
                         <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.stock} UNITS REMAINING</span>
                      </div>
                   </div>

                   <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                     <div className="flex flex-col">
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">Cost Requirement</p>
                        <div className="flex items-center gap-2 font-black text-2xl tracking-tighter text-black">
                         <Coins className="w-5 h-5 text-[#1E4D3B]" /> {item.cost.toLocaleString()}
                        </div>
                     </div>

                     <Button size="icon" onClick={() => handleRedeem(item)}
                       className={cn(
                          "w-14 h-14 rounded-2xl shadow-xl transition-all duration-300 active:scale-90",
                          xp >= item.cost ? "bg-[#1E4D3B] hover:bg-black text-white shadow-emerald-900/10" : "bg-slate-100 text-slate-300 cursor-not-allowed"
                       )}
                       disabled={xp < item.cost}
                     >
                       <Package size={24} />
                     </Button>
                   </div>
                 </CardContent>
               </Card>
             </motion.div>
           ))}
         </div>
      </div>

      {/* MY ORDERS */}
      <div className="space-y-8 pt-8">
        <h2 className="text-2xl font-black text-black uppercase tracking-tight flex items-center gap-3">
           <Truck className="text-[#1E4D3B]" size={24} /> Active Logistics
        </h2>

        {loadingOrders ? (
          <div className="flex items-center gap-3 py-10 opacity-30"><RefreshCw className="animate-spin" /> <span className="text-xs font-black uppercase tracking-widest">Scanning Network...</span></div>
        ) : redemptions.length === 0 ? (
          <div className="p-16 text-center rounded-[32px] border-2 border-dashed border-slate-100 bg-slate-50/50">
             <MapPin className="mx-auto text-slate-200 mb-4" size={48} />
             <p className="text-xs font-black uppercase text-slate-300 tracking-[0.4em]">Grid Synchronized. No Active Shipments.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            {redemptions.map((r, i) => {
              const status = autoUpdateStatus(r);
              const stepIndex = trackingSteps.indexOf(status);

              return (
                <Card key={r._id} className="rounded-[32px] border-slate-100 shadow-xl bg-white overflow-hidden group">
                  <CardContent className="p-0">
                    <div className="flex flex-col sm:flex-row">
                       <div className="w-full sm:w-48 h-48 bg-slate-50 relative">
                          <img src={r.item.image} className="w-full h-full object-cover border-r border-slate-50" />
                          <div className="absolute bottom-0 left-0 right-0 p-3 bg-black/60 backdrop-blur-md text-white border-t border-white/10">
                             <p className="text-[9px] font-black uppercase tracking-widest text-center truncate">{r.item.name}</p>
                          </div>
                       </div>
                       <div className="flex-1 p-8 space-y-6">
                         <div className="flex justify-between items-start">
                            <div>
                               <p className="text-[9px] font-black uppercase tracking-widest text-[#1E4D3B] mb-1">Deployment Phase</p>
                               <h3 className="text-2xl font-black text-black uppercase tracking-tighter">{status}</h3>
                            </div>
                            <Badge className="bg-[#1E4D3B]/10 text-[#1E4D3B] border-0 text-[10px] font-black px-4 py-2 rounded-xl">ID: {r.trackingInfo?.trackingId.slice(-6)}</Badge>
                         </div>

                         <div className="flex gap-2">
                            {trackingSteps.map((step, idx) => (
                               <div key={idx} className={cn(
                                  "h-1.5 flex-1 rounded-full transition-all duration-1000",
                                  idx <= stepIndex ? "bg-[#1E4D3B] shadow-[0_0_10px_rgba(30,77,59,0.3)]" : "bg-slate-100"
                               )} />
                            ))}
                         </div>

                         <div className="flex items-center gap-4 text-slate-400">
                            <Clock size={14} />
                            <span className="text-[10px] font-black uppercase tracking-widest">ETA: {r.trackingInfo?.estimatedDelivery || "TBD"}</span>
                         </div>
                       </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* ADDRESS DIALOG (STRICT THEME) */}
      <Dialog open={showAddressDialog} onOpenChange={setShowAddressDialog}>
        <DialogContent className="max-w-md rounded-[48px] border-0 p-12 bg-white shadow-2xl">
          <DialogHeader className="text-center space-y-4">
            <div className="w-20 h-20 rounded-[28px] bg-[#1E4D3B] text-white flex items-center justify-center mx-auto mb-2 shadow-2xl rotate-3">
               <MapPin size={40} />
            </div>
            <DialogTitle className="text-3xl font-black tracking-tighter text-center uppercase">Shipping Directive</DialogTitle>
            <DialogDescription className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-300">Target Object: {selectedItem?.name}</DialogDescription>
          </DialogHeader>

          <div className="space-y-6 pt-8">
            <div className="space-y-2">
               <Label className="text-[10px] font-black uppercase tracking-[0.3em] ml-2 text-slate-400">Full Signature</Label>
               <Input value={address.fullName} onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                 className="rounded-2xl border-slate-100 h-14 bg-slate-50 font-black px-6 focus:border-[#1E4D3B]" placeholder="EX: JOHN SILVER" />
            </div>
            <div className="space-y-2">
               <Label className="text-[10px] font-black uppercase tracking-[0.3em] ml-2 text-slate-400">Street Coordinates</Label>
               <Input value={address.street} onChange={(e) => setAddress({ ...address, street: e.target.value })}
                 className="rounded-2xl border-slate-100 h-14 bg-slate-50 font-black px-6 focus:border-[#1E4D3B]" placeholder="EX: 742 EVERGREEN TERRACE" />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-[0.3em] ml-2 text-slate-400">City</Label>
                  <Input value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })}
                    className="rounded-2xl border-slate-100 h-12 bg-slate-50 font-black px-6 focus:border-[#1E4D3B]" />
               </div>
               <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-[0.3em] ml-2 text-slate-400">Zip Code</Label>
                  <Input value={address.zipCode} onChange={(e) => setAddress({ ...address, zipCode: e.target.value })}
                    className="rounded-2xl border-slate-100 h-12 bg-slate-50 font-black px-6 focus:border-[#1E4D3B]" />
               </div>
            </div>
          </div>

          <div className="pt-10">
            <Button onClick={handleAddressSubmit} disabled={redeeming}
              className="w-full h-16 bg-[#1E4D3B] hover:bg-black text-white rounded-3xl font-black uppercase tracking-[0.4em] text-[11px] shadow-2xl shadow-emerald-900/40 active:scale-95 transition-all">
              {redeeming ? "AUTHORIZING..." : "EXECUTE REDEMPTION"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* SUCCESS POPUP (RESTYLED) */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowSuccess(false)}>

            <motion.div className="bg-white rounded-[64px] p-16 max-w-lg text-center space-y-8 shadow-3xl overflow-hidden relative"
              initial={{ scale: 0.8, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, y: 50 }}
              onClick={(e) => e.stopPropagation()}>
              
              <div className="absolute top-0 left-0 right-0 h-4 bg-[#1E4D3B]" />

              <div className="w-24 h-24 rounded-[36px] bg-[#1E4D3B] text-white flex items-center justify-center mx-auto shadow-2xl shadow-emerald-900/40">
                 <BadgeCheck size={56} className="animate-bounce" />
              </div>

              <div className="space-y-4">
                 <h2 className="text-4xl font-black text-black uppercase tracking-tighter">REDEMPTION SECURED</h2>
                 <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Logistics Protocol Initiated</p>
              </div>

              {trackingInfo && (
                <div className="p-8 rounded-[32px] bg-slate-50 space-y-2">
                   <p className="text-[9px] font-black uppercase tracking-widest text-[#1E4D3B]">Tracking Signature</p>
                   <p className="text-2xl font-black text-black tracking-widest">{trackingInfo.trackingId}</p>
                </div>
              )}

              <Button onClick={() => setShowSuccess(false)} 
                className="w-full h-16 bg-black hover:bg-[#1E4D3B] text-white rounded-3xl font-black uppercase tracking-widest text-xs transition-colors">
                Continue Exploration
              </Button>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default StorePage;
