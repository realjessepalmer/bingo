'use client';

interface InfoDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InfoDialog({ isOpen, onClose }: InfoDialogProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] p-4 sm:p-6 border border-gray-200 animate-scale-in overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">What is Booth Bingo?</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors text-2xl font-bold leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        
        <div className="overflow-y-auto flex-1 pr-2">
          <div className="space-y-4 text-sm sm:text-base text-gray-700">
            <p className="mb-4">
              Booth Bingo is a way for PSIFF 2026 projectionists to track festival occurrences. When things happen that you recognize from the bingo card, mark them. Or not. It's just a dumb game.
            </p>

            <div>
              <h3 className="font-bold text-lg mb-2 text-gray-800">How to Play</h3>
              
              <div className="mb-3">
                <p className="font-semibold mb-1">Marking Items</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Tap any cell on your theatre's bingo card when that item occurs</li>
                  <li>The center square is always marked (it's the free space). You can even edit it if you want.</li>
                  <li>You can unmark items if you made a mistake</li>
                </ul>
              </div>

              <div className="mb-3">
                <p className="font-semibold mb-1">Getting a Bingo</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Complete any row, column, or diagonal</li>
                  <li>A dialog will appear asking you to confirm</li>
                  <li>Once confirmed, bingos cannot be reversed!</li>
                  <li>Confirmed bingos lock those cells and they cannot be changed</li>
                </ul>
              </div>

              <div className="mb-3">
                <p className="font-semibold mb-1">Editing Cards</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Click on any theatre card to edit it</li>
                  <li>You'll get a 3-minute editing session (shown by the lock timer)</li>
                  <li>If someone else is editing a card, you'll see it's locked</li>
                  <li>The lock refreshes when you interact with the card</li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-2 text-gray-800">Features</h3>
              
              <div className="mb-3">
                <p className="font-semibold mb-1">Comments</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Long press (or click the comment icon) any cell to add a comment</li>
                  <li>Useful for juicy gossip</li>
                  <li>Comments are visible to everyone viewing that card</li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-2 text-gray-800">Notes</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>No logins because it's overkill. We're going with the honor system here.</li>
                <li>Cards are shared across all users, so you'll see updates from other projectionists</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white 
              rounded-lg hover:from-blue-600 hover:to-blue-700 active:scale-95 
              transition-all duration-200 font-semibold shadow-md"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}

