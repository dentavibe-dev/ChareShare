import React, { useEffect, useState } from 'react';
import { ArrowLeftIcon, BellIcon, MenuIcon, StarIcon, PlusCircleIcon, LogOutIcon, EllipsisVertical, Share2Icon, XIcon, SendIcon, MessageCircleIcon, MailIcon, SendHorizontalIcon } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogTitle } from '../../components/ui/dialog';

interface CareProvider {
  type: string;
  icon: string;
  bgColor: string;
}

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export const Dashboard = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showHelpChat, setShowHelpChat] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! How can I help you today?",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  useEffect(() => {
    const getUserProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.user_metadata?.full_name) {
        setUserName(user.user_metadata.full_name);
      }
      if (user?.email === 'admin@gmail.com') {
        setIsAdmin(true);
      }
    };
    getUserProfile();
  }, []);
  
  const providers: CareProvider[] = [
    { type: 'Dentist', icon: '/dentist.svg', bgColor: 'bg-blue-50' },
    { type: 'Physiotherapist', icon: '/physiotherapist.svg', bgColor: 'bg-green-50' },
    { type: 'Massage Therapist', icon: '/massagetherapist.svg', bgColor: 'bg-orange-50' },
    { type: 'Podiatrist', icon: '/podiatrist.svg', bgColor: 'bg-teal-50' },
    { type: 'Physician', icon: '/physician.svg', bgColor: 'bg-red-50' },
    { type: 'Cardiologist', icon: '/cardiologist.svg', bgColor: 'bg-pink-50' },
    { type: 'Dermatologist', icon: '/dermatologist.svg', bgColor: 'bg-yellow-50' },
    { type: 'Neurologist', icon: '/neurologist.svg', bgColor: 'bg-indigo-50' },
    { type: 'Orthopedic Surgeon', icon: '/orthopedic.svg', bgColor: 'bg-gray-50' },
    { type: 'Pediatrician', icon: '/pediatrician.svg', bgColor: 'bg-purple-50' },
  ];

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleProviderClick = (type: string) => {
    navigate(`/find-provider?specialty=${encodeURIComponent(type)}`);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      text: message,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage('');

    // Simulate bot response
    setTimeout(() => {
      const botMessage: Message = {
        id: messages.length + 2,
        text: "Thanks for your message. Our team will get back to you soon.",
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    }, 1000);
  };

  const handleShare = (platform: 'whatsapp' | 'gmail' | 'telegram') => {
    const shareUrl = window.location.href;
    const shareText = `Check out my Care Circle at CareCircle! ${shareUrl}`;
    
    const shareLinks = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText)}`,
      gmail: `https://mail.google.com/mail/?view=cm&fs=1&body=${encodeURIComponent(shareText)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent('Check out my Care Circle at CareCircle!')}`
    };

    window.open(shareLinks[platform], '_blank');
    setShowShareDialog(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 flex flex-col bg-white border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
            <h1 className="text-lg font-medium">Your Care Circle</h1>
          </div>
          <div className="flex items-center gap-4">
            {userName && (
              <p className="hidden md:block text-lg font-medium text-gray-700">
                Welcome, {userName}
              </p>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger className="focus:outline-none">
                <EllipsisVertical className="w-5 h-5 text-gray-600" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {isAdmin && (
                  <>
                    <DropdownMenuItem
                      className="flex items-center gap-2 cursor-pointer"
                      onClick={() => navigate('/add-doctor')}
                    >
                      <span>Add Doctor</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="flex items-center gap-2 cursor-pointer"
                      onClick={() => navigate('/manage-doctors')}
                    >
                      <span>Manage Doctors</span>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuItem
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={handleSignOut}
                >
                  <LogOutIcon className="w-4 h-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        {userName && (
          <p className="text-sm text-gray-600 mt-1 md:hidden">
            Welcome, {userName}
          </p>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        {isMobile ? (
          // Mobile Layout - Improved responsiveness
          <div className="w-full max-w-sm mx-auto">
            {/* Centered User Circle */}
            <div className="flex justify-center mb-8">
              <Link to="/profile" className="w-20 h-20 rounded-full bg-white shadow-lg flex items-center justify-center p-1">
                <img 
                  src="https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=150"
                  alt="User"
                  className="w-full h-full rounded-full object-cover"
                />
              </Link>
            </div>
            
            {/* Provider Grid - Responsive 2 columns */}
            <div className="grid grid-cols-2 gap-4">
              {providers.map((provider) => (
                <div
                  key={provider.type}
                  className={`${provider.bgColor} rounded-xl p-4 flex flex-col items-center cursor-pointer transition-transform hover:scale-105 min-h-[100px] justify-center`}
                  onClick={() => handleProviderClick(provider.type)}
                >
                  <img 
                    src={provider.icon} 
                    alt={provider.type}
                    className="w-8 h-8 mb-3"
                  />
                  <p className="text-xs font-medium text-gray-900 text-center leading-tight">
                    {provider.type}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          // Desktop Circle Layout
          <div className="relative w-[700px] h-[700px]">
            <Link to="/profile" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
              <div className="w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center p-1">
                <img 
                  src="https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=150"
                  alt="User"
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
            </Link>
            {providers.map((provider, index) => {
              const angle = (index * 360) / providers.length;
              const radius = 280;
              const left = 350 + radius * Math.cos((angle - 90) * (Math.PI / 180));
              const top = 350 + radius * Math.sin((angle - 90) * (Math.PI / 180));

              return (
                <div
                  key={provider.type}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${left}px`, top: `${top}px` }}
                >
                  <div 
                    className="bg-white rounded-lg shadow-md p-4 w-36 cursor-pointer transition-transform hover:scale-105"
                    onClick={() => handleProviderClick(provider.type)}
                  >
                    <img src={provider.icon} alt={provider.type} className="w-8 h-8 mx-auto mb-2" />
                    <div className="text-center">
                      <p className="font-medium text-gray-900 text-sm leading-tight">{provider.type}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-24 right-4 z-20">
        <button 
          onClick={() => setShowHelpChat(true)}
          className="w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-blue-600 transition-colors"
        >
          <PlusCircleIcon className="w-6 h-6" />
        </button>
      </div>

      {/* Bottom Action */}
      <div className="p-4 bg-white border-t">
        <div className="max-w-md mx-auto">
          <button 
            onClick={() => setShowShareDialog(true)}
            className="w-full bg-blue-500 text-white rounded-full py-3 px-4 flex items-center justify-center gap-2 text-sm hover:bg-blue-600 transition-colors"
          >
            <Share2Icon className="w-4 h-4" />
            Share Your Care Circle
          </button>
        </div>
      </div>

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="w-[calc(100%-2rem)] sm:w-full max-w-[425px] p-6">
          <DialogTitle className="text-xl font-semibold mb-4 text-center">Share Your Care Circle</DialogTitle>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => handleShare('whatsapp')}
              className="flex items-center gap-3 w-full p-4 rounded-lg hover:bg-green-100 transition-colors"
            >
              <MessageCircleIcon className="w-6 h-6 text-green-600" />
              <span className="text-green-900 font-medium">Share via WhatsApp</span>
            </button>
            <button
              onClick={() => handleShare('gmail')}
              className="flex items-center gap-3 w-full p-4 rounded-lg hover:bg-red-100 transition-colors"
            >
              <MailIcon className="w-6 h-6 text-red-600" />
              <span className="text-red-900 font-medium">Share via Gmail</span>
            </button>
            <button
              onClick={() => handleShare('telegram')}
              className="flex items-center gap-3 w-full p-4 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <SendHorizontalIcon className="w-6 h-6 text-blue-600" />
              <span className="text-blue-900 font-medium">Share via Telegram</span>
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Help Chat Dialog */}
      <Dialog open={showHelpChat} onOpenChange={setShowHelpChat}>
        <DialogContent className="sm:max-w-[400px] p-0 [&>button]:text-white">
          <div className="flex flex-col h-[500px]">
            {/* Chat Header */}
            <div className="p-4 border-b flex justify-between items-center bg-blue-500 text-white rounded-t-lg">
              <DialogTitle className="font-semibold">Help Chat</DialogTitle>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      msg.isUser
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <p className="text-sm">{msg.text}</p>
                    <p className="text-xs mt-1 opacity-70">
                      {msg.timestamp.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-3 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="bg-blue-500 text-white rounded-full p-2 hover:bg-blue-600"
                >
                  <SendIcon className="w-5 h-5" />
                </button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};