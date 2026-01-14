import { motion, AnimatePresence } from "framer-motion";
import { X, Search, Copy, Share2, UserPlus, Users } from "lucide-react";
import { useState } from "react";

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (username: string) => void;
}

const dummyFriends = [
  { id: "1", name: "Alex Gaming", status: "online", avatarLetter: "A" },
  { id: "2", name: "Sarah Pro", status: "online", avatarLetter: "S" },
  { id: "3", name: "Mike Cards", status: "away", avatarLetter: "M" },
  { id: "4", name: "Luna Star", status: "offline", avatarLetter: "L" },
];

export const InviteModal = ({
  isOpen,
  onClose,
  onInvite,
}: InviteModalProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [copied, setCopied] = useState(false);

  const filteredFriends = dummyFriends.filter((friend) =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCopyLink = () => {
    navigator.clipboard.writeText("https://eleven-game.com/invite/abc123");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const statusColors = {
    online: "bg-emerald-500",
    away: "bg-yellow-500",
    offline: "bg-slate-500",
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="modal-scale-wrapper relative w-full max-w-md bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl border border-slate-700/50 shadow-2xl overflow-hidden"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25 }}
          >
            {/* Header */}
            <div className="relative p-6 pb-4 border-b border-slate-700/50">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                  Invite Friends
                </h2>
                <motion.button
                  onClick={onClose}
                  className="w-10 h-10 rounded-full bg-slate-700/50 flex items-center justify-center text-slate-400 hover:bg-slate-600 hover:text-white transition-all"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X size={20} />
                </motion.button>
              </div>
            </div>

            {/* Search */}
            <div className="p-4">
              <div className="relative">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search friends..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl py-3 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>
            </div>

            {/* Friends List */}
            <div className="px-4 pb-4 max-h-64 overflow-y-auto custom-scrollbar">
              {filteredFriends.length > 0 ? (
                <div className="space-y-2">
                  {filteredFriends.map((friend, index) => (
                    <motion.div
                      key={friend.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                            {friend.avatarLetter}
                          </div>
                          <div
                            className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-slate-800 ${
                              statusColors[
                                friend.status as keyof typeof statusColors
                              ]
                            }`}
                          />
                        </div>
                        <div>
                          <p className="font-semibold text-white">
                            {friend.name}
                          </p>
                          <p className="text-xs text-slate-400 capitalize">
                            {friend.status}
                          </p>
                        </div>
                      </div>
                      <motion.button
                        onClick={() => onInvite(friend.name)}
                        className="px-4 py-2 rounded-lg bg-blue-500/20 text-blue-400 font-medium opacity-0 group-hover:opacity-100 hover:bg-blue-500 hover:text-white transition-all flex items-center gap-2"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        disabled={friend.status === "offline"}
                      >
                        <UserPlus size={16} />
                        Invite
                      </motion.button>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-slate-500">
                  <p>No friends found</p>
                </div>
              )}
            </div>

            {/* Share Section */}
            <div className="p-4 pt-0 space-y-3">
              <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
              <p className="text-slate-400 text-sm text-center">
                Or share invite link
              </p>
              <div className="flex gap-2">
                <motion.button
                  onClick={handleCopyLink}
                  className="flex-1 py-3 rounded-xl bg-slate-700/50 hover:bg-slate-600 text-white font-medium flex items-center justify-center gap-2 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Copy size={18} />
                  {copied ? "Copied!" : "Copy Link"}
                </motion.button>
                <motion.button
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium flex items-center justify-center gap-2 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Share2 size={18} />
                  Share
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
