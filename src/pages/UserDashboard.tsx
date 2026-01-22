import { motion } from 'framer-motion';
import { User, Heart } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { FloatingPaws, BlobShape } from '@/components/ui/decorative-shapes';

const UserDashboard = () => {
  const { user } = useAuth();

  return (
    <Layout>
      <div className="min-h-[80vh] flex items-center justify-center relative overflow-hidden paw-pattern">
        <FloatingPaws />
        
        {/* Decorative Elements */}
        <div className="absolute top-20 right-20 w-64 h-64 opacity-20">
          <BlobShape className="w-full h-full text-primary" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center px-4 relative z-10"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary mb-8"
          >
            <User className="w-12 h-12 text-primary-foreground" />
          </motion.div>

          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Welcome, {user?.first_name}!
          </h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto mb-4">
            You are entering as a <span className="font-semibold text-primary">User</span>
          </p>
          <div className="inline-flex items-center gap-2 text-muted-foreground">
            <Heart className="w-4 h-4 text-primary" />
            <span>Thank you for being part of our community</span>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default UserDashboard;
