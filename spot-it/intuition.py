SYMBOLS_PER_CARD = 3
next_symbol = SYMBOLS_PER_CARD
symbols = [ i for i in range(SYMBOLS_PER_CARD) for _ in range(SYMBOLS_PER_CARD) ]
deck = []
counter = 0

deck_complete = False

while not deck_complete and counter < 100:
    new_card = []

    if not deck:
        for _ in range(SYMBOLS_PER_CARD):
            # filter symbols down to those that aren't in the card
            available_symbols = [s for s in symbols if s not in new_card]
            if available_symbols:
                symbol = available_symbols[0]
                symbols.pop(symbols.index(symbol))
                new_card.append(symbol)

    for card in deck:
        card_matched = False
        if len(new_card) >= SYMBOLS_PER_CARD:
            card_matched = True
        if len(set(card + new_card)) < len(card + new_card):
            card_matched = True
        else:
            print(new_card, card)
        for symbol in card:
            if card_matched:
                break
            double = False
            for card in deck:
                if len(set(new_card + [symbol]) & set(card)) > 1:
                    double = True
            if symbol in symbols and not double:
                symbols.pop(symbols.index(symbol))
                new_card.append(symbol)
                card_matched = True
        if not card_matched:
            deck_complete = True
            if symbols:
                print("Fail to match", new_card, card)
            break

    if len(new_card) < SYMBOLS_PER_CARD and not deck_complete:
        symbolsToAdd = SYMBOLS_PER_CARD - len(new_card)
        for _ in range(symbolsToAdd):
            symbol = next_symbol
            new_card.append(symbol)
            symbols += [next_symbol for _ in range(SYMBOLS_PER_CARD - 1)]
            next_symbol += 1

            
    if new_card:
        deck.append(new_card)

    counter += 1

print(deck)
print(set([symbol for card in deck for symbol in card]))