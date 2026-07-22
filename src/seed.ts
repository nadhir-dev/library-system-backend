import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import {
  Author,
  Book,
  BookComment,
  BookRequest,
  Customer,
  Order,
} from "./models/books";
import User from "./models/users";

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/library";

const authorData = [
  { name: "Gabriel García Márquez", nationality: "Colombian", birthYear: 1927, bio: "Colombian novelist and Nobel laureate known for magical realism." },
  { name: "Haruki Murakami", nationality: "Japanese", birthYear: 1949, bio: "Japanese writer known for surreal and existential fiction." },
  { name: "Chimamanda Ngozi Adichie", nationality: "Nigerian", birthYear: 1977, bio: "Nigerian novelist and feminist icon." },
  { name: "Italo Calvino", nationality: "Italian", birthYear: 1923, bio: "Italian journalist and writer of postmodern fables." },
  { name: "Ursula K. Le Guin", nationality: "American", birthYear: 1929, bio: "American author of speculative fiction and fantasy." },
  { name: "Jorge Luis Borges", nationality: "Argentine", birthYear: 1899, bio: "Argentine short-story writer and poet." },
  { name: "Toni Morrison", nationality: "American", birthYear: 1931, bio: "American novelist and Nobel laureate." },
  { name: "Milan Kundera", nationality: "Czech", birthYear: 1929, bio: "Czech-born French writer of philosophical fiction." },
  { name: "Elena Ferrante", nationality: "Italian", birthYear: 1943, bio: "Anonymous Italian novelist known for the Neapolitan Novels." },
  { name: "Octavia E. Butler", nationality: "American", birthYear: 1947, bio: "African American science fiction writer." },
  { name: "Albert Camus", nationality: "French", birthYear: 1913, bio: "French-Algerian philosopher and Nobel laureate." },
  { name: "Virginia Woolf", nationality: "British", birthYear: 1882, bio: "English modernist writer and essayist." },
  { name: "Fyodor Dostoevsky", nationality: "Russian", birthYear: 1821, bio: "Russian novelist of existential and psychological depth." },
  { name: "Clarice Lispector", nationality: "Brazilian", birthYear: 1920, bio: "Brazilian novelist and short-story writer." },
  { name: "Wole Soyinka", nationality: "Nigerian", birthYear: 1934, bio: "Nigerian playwright and Nobel laureate." },
  { name: "Franz Kafka", nationality: "Czech", birthYear: 1883, bio: "Bohemian writer of existential and absurdist fiction." },
  { name: "Isabel Allende", nationality: "Chilean", birthYear: 1942, bio: "Chilean author known for novels rooted in magical realism." },
  { name: "Leo Tolstoy", nationality: "Russian", birthYear: 1828, bio: "Russian novelist regarded as one of the greatest authors of all time." },
  { name: "Jane Austen", nationality: "British", birthYear: 1775, bio: "English novelist known for romantic fiction and social commentary." },
  { name: "Gabriel Okara", nationality: "Nigerian", birthYear: 1921, bio: "Nigerian poet and novelist known for poetic language." },
  { name: "Mariama Bâ", nationality: "Senegalese", birthYear: 1929, bio: "Senegalese author and feminist writer." },
  { name: "Naguib Mahfouz", nationality: "Egyptian", birthYear: 1911, bio: "Egyptian novelist and Nobel laureate in literature." },
  { name: "Yukio Mishima", nationality: "Japanese", birthYear: 1925, bio: "Japanese author known for his avant-garde works." },
  { name: "Kahlil Gibran", nationality: "Lebanese", birthYear: 1883, bio: "Lebanese-American writer, poet and visual artist." },
  { name: "Ryu Murakami", nationality: "Japanese", birthYear: 1952, bio: "Japanese novelist and filmmaker known for transgressive fiction." },
  { name: "Margaret Atwood", nationality: "Canadian", birthYear: 1939, bio: "Canadian poet and novelist known for speculative fiction." },
  { name: "Herman Melville", nationality: "American", birthYear: 1819, bio: "American novelist and poet of the American Renaissance." },
  { name: "Arundhati Roy", nationality: "Indian", birthYear: 1961, bio: "Indian author and political activist." },
  { name: "George Orwell", nationality: "British", birthYear: 1903, bio: "English novelist and essayist known for dystopian fiction." },
  { name: "Tayeb Salih", nationality: "Sudanese", birthYear: 1929, bio: "Sudanese writer and one of the most influential Arab authors." },
  { name: "Assia Djebar", nationality: "Algerian", birthYear: 1936, bio: "Algerian novelist and filmmaker writing in French." },
  { name: "Mikhail Bulgakov", nationality: "Russian", birthYear: 1891, bio: "Russian writer known for satire and magical realism." },
  { name: "H.P. Lovecraft", nationality: "American", birthYear: 1890, bio: "American writer of weird and cosmic horror fiction." },
  { name: "Agatha Christie", nationality: "British", birthYear: 1890, bio: "English writer of detective novels and short stories." },
];

const bookData = [
  { title: "One Hundred Years of Solitude", authors: ["Gabriel García Márquez"], genre: "Novel", publishedYear: 1967, quantity: 15, price: 24.99, edition: 1, language: "spanish", cover: "https://covers.openlibrary.org/b/id/12631574-L.jpg", description: "The multi-generational saga of the Buendia family in the fictional town of Macondo, blending reality and myth in a masterpiece of magical realism." },
  { title: "Love in the Time of Cholera", authors: ["Gabriel García Márquez"], genre: "Novel", publishedYear: 1985, quantity: 8, price: 18.50, edition: 2, language: "spanish", cover: "https://covers.openlibrary.org/b/id/12641360-L.jpg", description: "A sweeping tale of unrequited love spanning half a century, following Florentino Ariza's unwavering devotion to Fermina Daza." },
  { title: "Chronicle of a Death Foretold", authors: ["Gabriel García Márquez"], genre: "Novel", publishedYear: 1981, quantity: 10, price: 13.99, edition: 3, language: "spanish", cover: "https://covers.openlibrary.org/b/id/12636415-L.jpg", description: "A murder is recounted from multiple perspectives as a town pieces together the events leading to a foretold killing." },
  { title: "The Autumn of the Patriarch", authors: ["Gabriel García Márquez"], genre: "Novel", publishedYear: 1975, quantity: 6, price: 15.99, edition: 2, language: "spanish", cover: "https://covers.openlibrary.org/b/id/12643283-L.jpg", description: "A surreal exploration of the solitude and decay of an eternal Caribbean dictator told in a single flowing narrative." },
  { title: "Kafka on the Shore", authors: ["Haruki Murakami"], genre: "Fiction", publishedYear: 2002, quantity: 12, price: 15.99, edition: 1, language: "japanese", cover: "https://covers.openlibrary.org/b/id/12629285-L.jpg", description: "A surreal journey intertwining a teenage runaway and an elderly cat-talker, exploring fate, memory, and the mysteries of the human psyche." },
  { title: "Norwegian Wood", authors: ["Haruki Murakami"], genre: "Fiction", publishedYear: 1987, quantity: 20, price: 14.99, edition: 3, language: "japanese", cover: "https://covers.openlibrary.org/b/id/12625984-L.jpg", description: "A nostalgic story of love, loss, and coming of age set in 1960s Tokyo, centering on a young man's complex relationships." },
  { title: "The Wind-Up Bird Chronicle", authors: ["Haruki Murakami"], genre: "Fiction", publishedYear: 1994, quantity: 6, price: 16.99, edition: 1, language: "japanese", cover: "https://covers.openlibrary.org/b/id/12626041-L.jpg", description: "A metaphysical detective story following Toru Okada as he searches for his missing cat and wife, descending into a surreal underworld." },
  { title: "1Q84", authors: ["Haruki Murakami"], genre: "Fiction", publishedYear: 2009, quantity: 18, price: 18.99, edition: 1, language: "japanese", cover: "https://covers.openlibrary.org/b/id/12629376-L.jpg", description: "Two parallel narratives converge in an alternate 1984 Tokyo, where a cult, a assassin, and a writer are drawn together by fate." },
  { title: "Half of a Yellow Sun", authors: ["Chimamanda Ngozi Adichie"], genre: "Historical", publishedYear: 2006, quantity: 10, price: 13.99, edition: 1, language: "english", cover: "https://covers.openlibrary.org/b/id/14627352-L.jpg", description: "Set during the Biafran war in Nigeria, this novel follows the intertwined lives of five characters caught in the turmoil of civil conflict." },
  { title: "Americanah", authors: ["Chimamanda Ngozi Adichie"], genre: "Fiction", publishedYear: 2013, quantity: 14, price: 12.99, edition: 1, language: "english", cover: "https://covers.openlibrary.org/b/id/12604543-L.jpg", description: "A sharp, witty exploration of race, identity, and belonging through the eyes of a young Nigerian woman navigating life in America and England." },
  { title: "Purple Hibiscus", authors: ["Chimamanda Ngozi Adichie"], genre: "Fiction", publishedYear: 2003, quantity: 11, price: 12.99, edition: 2, language: "english", cover: "https://covers.openlibrary.org/b/id/14629761-L.jpg", description: "A coming-of-age story set in post-colonial Nigeria about a young girl struggling to break free from her oppressive father." },
  { title: "Invisible Cities", authors: ["Italo Calvino"], genre: "Fiction", publishedYear: 1972, quantity: 7, price: 11.50, edition: 2, language: "italian", cover: "https://covers.openlibrary.org/b/id/12624411-L.jpg", description: "Marco Polo describes fifty-six fantastical cities to Kublai Khan, each a meditation on language, memory, and the nature of urban life." },
  { title: "If on a Winter's Night a Traveler", authors: ["Italo Calvino"], genre: "Postmodern", publishedYear: 1979, quantity: 5, price: 14.50, edition: 1, language: "italian", cover: "https://covers.openlibrary.org/b/id/12644918-L.jpg", description: "A postmodern puzzle about the act of reading itself, weaving ten incomplete stories into a single mesmerizing narrative." },
  { title: "The Baron in the Trees", authors: ["Italo Calvino"], genre: "Fiction", publishedYear: 1957, quantity: 8, price: 11.99, edition: 3, language: "italian", cover: "https://covers.openlibrary.org/b/id/12624080-L.jpg", description: "A young baron climbs into the trees and never comes down, living an entire extraordinary life above the ground." },
  { title: "The Left Hand of Darkness", authors: ["Ursula K. Le Guin"], genre: "Science Fiction", publishedYear: 1969, quantity: 11, price: 13.99, edition: 4, language: "english", cover: "https://covers.openlibrary.org/b/id/12614799-L.jpg", description: "An envoy travels to the icy planet Gethen, where inhabitants are ambisexual, challenging human assumptions about gender and identity." },
  { title: "A Wizard of Earthsea", authors: ["Ursula K. Le Guin"], genre: "Fantasy", publishedYear: 1968, quantity: 9, price: 11.99, edition: 3, language: "english", cover: "https://covers.openlibrary.org/b/id/12614780-L.jpg", description: "A young wizard named Ged learns humility and wisdom through a perilous journey across a richly imagined archipelago." },
  { title: "The Dispossessed", authors: ["Ursula K. Le Guin"], genre: "Science Fiction", publishedYear: 1974, quantity: 10, price: 14.99, edition: 3, language: "english", cover: "https://covers.openlibrary.org/b/id/12614637-L.jpg", description: "A brilliant physicist from an anarchist utopia travels to its capitalist neighbor world, challenging both societies' fundamental assumptions." },
  { title: "Ficciones", authors: ["Jorge Luis Borges"], genre: "Short Stories", publishedYear: 1944, quantity: 13, price: 10.99, edition: 5, language: "spanish", cover: "https://covers.openlibrary.org/b/id/12639478-L.jpg", description: "A collection of labyrinthine short stories that blur the boundaries between reality, literature, and infinite possibility." },
  { title: "The Aleph", authors: ["Jorge Luis Borges"], genre: "Short Stories", publishedYear: 1949, quantity: 4, price: 12.50, edition: 2, language: "spanish", cover: "https://covers.openlibrary.org/b/id/12649517-L.jpg", description: "Borges explores metaphysical themes through tales of infinite libraries, secret labyrinths, and the point that contains all points." },
  { title: "Beloved", authors: ["Toni Morrison"], genre: "Novel", publishedYear: 1987, quantity: 18, price: 15.99, edition: 1, language: "english", cover: "https://covers.openlibrary.org/b/id/12604435-L.jpg", description: "Haunted by the trauma of slavery, a former slave must confront the ghost of her baby daughter in this powerful and devastating novel." },
  { title: "Song of Solomon", authors: ["Toni Morrison"], genre: "Novel", publishedYear: 1977, quantity: 7, price: 14.99, edition: 2, language: "english", cover: "https://covers.openlibrary.org/b/id/12604467-L.jpg", description: "A young man's quest for identity and family history leads him from the Midwest to the rural South in this lyrical coming-of-age story." },
  { title: "The Bluest Eye", authors: ["Toni Morrison"], genre: "Novel", publishedYear: 1970, quantity: 12, price: 12.99, edition: 3, language: "english", cover: "https://covers.openlibrary.org/b/id/12604435-L.jpg", description: "A young Black girl in 1940s Ohio prays for blue eyes, exposing the devastating effects of internalized racism and societal beauty standards." },
  { title: "The Unbearable Lightness of Being", authors: ["Milan Kundera"], genre: "Philosophical", publishedYear: 1984, quantity: 16, price: 13.50, edition: 3, language: "czech", cover: "https://covers.openlibrary.org/b/id/12639072-L.jpg", description: "A philosophical exploration of love, fate, and freedom set against the backdrop of the Prague Spring." },
  { title: "My Brilliant Friend", authors: ["Elena Ferrante"], genre: "Novel", publishedYear: 2011, quantity: 22, price: 16.99, edition: 1, language: "italian", cover: "https://covers.openlibrary.org/b/id/12604541-L.jpg", description: "The first of the Neapolitan Novels, tracing the fierce and complicated friendship between two girls growing up in postwar Naples." },
  { title: "The Story of a New Name", authors: ["Elena Ferrante"], genre: "Novel", publishedYear: 2012, quantity: 10, price: 17.99, edition: 1, language: "italian", cover: "https://covers.openlibrary.org/b/id/12615469-L.jpg", description: "Continuing the Neapolitan saga, Lila and Elena navigate marriage, ambition, and class struggle in 1960s Italy." },
  { title: "Kindred", authors: ["Octavia E. Butler"], genre: "Science Fiction", publishedYear: 1979, quantity: 9, price: 12.99, edition: 2, language: "english", cover: "https://covers.openlibrary.org/b/id/12624159-L.jpg", description: "A Black woman from 1970s California is repeatedly pulled back in time to a pre-Civil War plantation, confronting the brutal legacy of slavery." },
  { title: "Parable of the Sower", authors: ["Octavia E. Butler"], genre: "Science Fiction", publishedYear: 1993, quantity: 12, price: 14.99, edition: 1, language: "english", cover: "https://covers.openlibrary.org/b/id/12625827-L.jpg", description: "In a dystopian near-future America, a young woman develops a new belief system while fleeing societal collapse." },
  { title: "Parable of the Talents", authors: ["Octavia E. Butler"], genre: "Science Fiction", publishedYear: 1998, quantity: 8, price: 15.99, edition: 1, language: "english", cover: "https://covers.openlibrary.org/b/id/12624197-L.jpg", description: "The sequel to Parable of the Sower continues Lauren Olamina's struggle to build a community amid deepening chaos and religious extremism." },
  { title: "The Stranger", authors: ["Albert Camus"], genre: "Philosophical", publishedYear: 1942, quantity: 25, price: 9.99, edition: 6, language: "french", cover: "https://covers.openlibrary.org/b/id/12644973-L.jpg", description: "Meursault, an emotionally detached Algerian man, commits a senseless murder and faces the absurdity of existence and societal judgment." },
  { title: "The Plague", authors: ["Albert Camus"], genre: "Philosophical", publishedYear: 1947, quantity: 14, price: 11.99, edition: 4, language: "french", cover: "https://covers.openlibrary.org/b/id/12613065-L.jpg", description: "As a deadly plague grips the city of Oran, ordinary people must confront suffering, solidarity, and the meaning of resistance." },
  { title: "The Fall", authors: ["Albert Camus"], genre: "Philosophical", publishedYear: 1956, quantity: 9, price: 10.99, edition: 3, language: "french", cover: "https://covers.openlibrary.org/b/id/12613062-L.jpg", description: "A former Parisian lawyer delivers a haunting monologue confessing his moral failures and indicting an entire age of judgment." },
  { title: "Mrs Dalloway", authors: ["Virginia Woolf"], genre: "Modernist", publishedYear: 1925, quantity: 8, price: 10.99, edition: 7, language: "english", cover: "https://covers.openlibrary.org/b/id/12638193-L.jpg", description: "A single day in the life of Clarissa Dalloway as she prepares for a party, interweaving past and present through stream of consciousness." },
  { title: "To the Lighthouse", authors: ["Virginia Woolf"], genre: "Modernist", publishedYear: 1927, quantity: 11, price: 11.99, edition: 5, language: "english", cover: "https://covers.openlibrary.org/b/id/12639417-L.jpg", description: "The Ramsay family's summer holidays in the Hebrides become a profound meditation on time, art, and the inner lives of women." },
  { title: "The Waves", authors: ["Virginia Woolf"], genre: "Modernist", publishedYear: 1931, quantity: 6, price: 11.99, edition: 4, language: "english", cover: "https://covers.openlibrary.org/b/id/12639428-L.jpg", description: "Six voices narrate their lives through soliloquies, creating a poetic symphony of consciousness, identity, and the passage of time." },
  { title: "Crime and Punishment", authors: ["Fyodor Dostoevsky"], genre: "Novel", publishedYear: 1866, quantity: 20, price: 8.99, edition: 12, language: "russian", cover: "https://covers.openlibrary.org/b/id/12639385-L.jpg", description: "A destitute student murders a pawnbroker and wrestles with guilt, conscience, and redemption in the streets of St. Petersburg." },
  { title: "The Brothers Karamazov", authors: ["Fyodor Dostoevsky"], genre: "Novel", publishedYear: 1880, quantity: 13, price: 9.99, edition: 10, language: "russian", cover: "https://covers.openlibrary.org/b/id/12639495-L.jpg", description: "Three brothers grapple with faith, free will, and morality after their father is murdered in this towering philosophical drama." },
  { title: "Notes from Underground", authors: ["Fyodor Dostoevsky"], genre: "Novel", publishedYear: 1864, quantity: 10, price: 7.99, edition: 8, language: "russian", cover: "https://covers.openlibrary.org/b/id/12639380-L.jpg", description: "A bitter, isolated former civil servant delivers a furious monologue attacking rationalism, utopianism, and the nature of human freedom." },
  { title: "The Hour of the Star", authors: ["Clarice Lispector"], genre: "Novella", publishedYear: 1977, quantity: 6, price: 10.50, edition: 2, language: "portuguese", cover: "https://covers.openlibrary.org/b/id/14634257-L.jpg", description: "The impoverished, barely literate Macabea lives an invisible existence in Rio de Janeiro in this stark and luminous novella." },
  { title: "Near to the Wild Heart", authors: ["Clarice Lispector"], genre: "Novel", publishedYear: 1943, quantity: 4, price: 12.99, edition: 1, language: "portuguese", cover: "https://covers.openlibrary.org/b/id/14635889-L.jpg", description: "Joana's interior monologue traces her childhood and adult relationships in a fragmented, poetic exploration of selfhood." },
  { title: "Death and the King's Horseman", authors: ["Wole Soyinka"], genre: "Drama", publishedYear: 1975, quantity: 5, price: 13.99, edition: 2, language: "english", cover: "https://covers.openlibrary.org/b/id/12648995-L.jpg", description: "Based on true events, a Yoruba king's horseman must fulfill a ritual suicide disrupted by colonial authorities in Nigeria." },
  { title: "The Interpreters", authors: ["Wole Soyinka"], genre: "Novel", publishedYear: 1965, quantity: 3, price: 15.99, edition: 1, language: "english", cover: "https://covers.openlibrary.org/b/id/14637421-L.jpg", description: "A group of young Nigerian intellectuals reunites after university, debating tradition, modernity, and the meaning of independence." },
  { title: "The Book of Imaginary Beings", authors: ["Jorge Luis Borges"], genre: "Fantasy", publishedYear: 1967, quantity: 5, price: 14.99, edition: 2, language: "spanish", cover: "https://covers.openlibrary.org/b/id/12640991-L.jpg", description: "A bestiary of mythical creatures drawn from world folklore and literature, annotated with Borges's signature erudition and wit." },
  { title: "Immortality", authors: ["Milan Kundera"], genre: "Philosophical", publishedYear: 1990, quantity: 7, price: 14.99, edition: 2, language: "czech", cover: "https://covers.openlibrary.org/b/id/12639079-L.jpg", description: "A meditation on the nature of fame, identity, and mortality that intertwines Goethe with contemporary Parisian lives." },
  { title: "The Metamorphosis", authors: ["Franz Kafka"], genre: "Novella", publishedYear: 1915, quantity: 30, price: 7.99, edition: 15, language: "german", cover: "https://covers.openlibrary.org/b/id/12639327-L.jpg", description: "Gregor Samsa wakes up transformed into a giant insect and must navigate the horror and absurdity of his new existence." },
  { title: "The Trial", authors: ["Franz Kafka"], genre: "Novel", publishedYear: 1925, quantity: 18, price: 9.99, edition: 8, language: "german", cover: "https://covers.openlibrary.org/b/id/12639338-L.jpg", description: "Josef K. is arrested one morning for a crime that is never revealed, trapped in a nightmarish bureaucratic labyrinth." },
  { title: "The Castle", authors: ["Franz Kafka"], genre: "Novel", publishedYear: 1926, quantity: 7, price: 10.99, edition: 6, language: "german", cover: "https://covers.openlibrary.org/b/id/12649722-L.jpg", description: "A land surveyor struggles endlessly to reach the mysterious castle authorities who summoned him to their village." },
  { title: "The House of the Spirits", authors: ["Isabel Allende"], genre: "Novel", publishedYear: 1982, quantity: 15, price: 14.99, edition: 3, language: "spanish", cover: "https://covers.openlibrary.org/b/id/12644847-L.jpg", description: "The Trueba family saga spans four generations blending political upheaval with supernatural occurrences in an unnamed Latin American country." },
  { title: "Eva Luna", authors: ["Isabel Allende"], genre: "Novel", publishedYear: 1987, quantity: 8, price: 12.50, edition: 2, language: "spanish", cover: "https://covers.openlibrary.org/b/id/12604317-L.jpg", description: "A gifted storyteller born into poverty weaves her own extraordinary life story against a backdrop of revolution and passion." },
  { title: "War and Peace", authors: ["Leo Tolstoy"], genre: "Novel", publishedYear: 1869, quantity: 25, price: 11.99, edition: 20, language: "russian", cover: "https://covers.openlibrary.org/b/id/12639358-L.jpg", description: "An epic chronicle of Russian society during the Napoleonic Wars, following aristocratic families through love, loss, and transformation." },
  { title: "Anna Karenina", authors: ["Leo Tolstoy"], genre: "Novel", publishedYear: 1878, quantity: 22, price: 10.99, edition: 18, language: "russian", cover: "https://covers.openlibrary.org/b/id/12639371-L.jpg", description: "A married woman's passionate affair leads to social ostracism and tragedy in Tolstoy's sweeping portrait of Russian society." },
  { title: "The Death of Ivan Ilyich", authors: ["Leo Tolstoy"], genre: "Novella", publishedYear: 1886, quantity: 14, price: 7.99, edition: 12, language: "russian", cover: "https://covers.openlibrary.org/b/id/12639354-L.jpg", description: "A high-court judge facing his own mortality confronts the emptiness of a life lived entirely by social convention." },
  { title: "Pride and Prejudice", authors: ["Jane Austen"], genre: "Novel", publishedYear: 1813, quantity: 35, price: 8.50, edition: 25, language: "english", cover: "https://covers.openlibrary.org/b/id/12645171-L.jpg", description: "Elizabeth Bennet and Mr. Darcy navigate pride, prejudice, and social expectations in Austen's timeless comedy of manners." },
  { title: "Sense and Sensibility", authors: ["Jane Austen"], genre: "Novel", publishedYear: 1811, quantity: 12, price: 9.99, edition: 20, language: "english", cover: "https://covers.openlibrary.org/b/id/12644919-L.jpg", description: "The Dashwood sisters navigate love and heartbreak, balancing reason against emotion in a society that offers women few choices." },
  { title: "Emma", authors: ["Jane Austen"], genre: "Novel", publishedYear: 1815, quantity: 16, price: 9.99, edition: 18, language: "english", cover: "https://covers.openlibrary.org/b/id/12644907-L.jpg", description: "A wealthy young woman's well-meaning matchmaking schemes lead to comedic misunderstandings and unexpected romantic discoveries." },
  { title: "The Voice", authors: ["Gabriel Okara"], genre: "Novel", publishedYear: 1964, quantity: 5, price: 13.99, edition: 1, language: "english", cover: "https://covers.openlibrary.org/b/id/14636521-L.jpg", description: "A man's quest for clarity of expression and truth in a Nigerian village torn between tradition and Western influence." },
  { title: "So Long a Letter", authors: ["Mariama Bâ"], genre: "Novel", publishedYear: 1979, quantity: 10, price: 11.50, edition: 2, language: "french", cover: "https://covers.openlibrary.org/b/id/14634279-L.jpg", description: "A Senegalese woman writes to her best friend reflecting on polygamy, tradition, and the challenges facing educated African women." },
  { title: "Midaq Alley", authors: ["Naguib Mahfouz"], genre: "Novel", publishedYear: 1947, quantity: 14, price: 10.99, edition: 4, language: "arabic", cover: "https://covers.openlibrary.org/b/id/12649851-L.jpg", description: "The inhabitants of a Cairo alley struggle with love, ambition, and despair during World War II in this vivid microcosm of Egyptian society." },
  { title: "The Cairo Trilogy", authors: ["Naguib Mahfouz"], genre: "Novel", publishedYear: 1957, quantity: 9, price: 22.50, edition: 3, language: "arabic", cover: "https://covers.openlibrary.org/b/id/12604309-L.jpg", description: "A monumental family saga following three generations of a Cairo household through decades of political and social change." },
  { title: "Children of Gebelawi", authors: ["Naguib Mahfouz"], genre: "Novel", publishedYear: 1959, quantity: 7, price: 16.99, edition: 2, language: "arabic", cover: "https://covers.openlibrary.org/b/id/12649802-L.jpg", description: "An allegorical novel reimagining religious history through generations of a family living in a Cairo alley, banned for its bold themes." },
  { title: "The Temple of the Golden Pavilion", authors: ["Yukio Mishima"], genre: "Novel", publishedYear: 1956, quantity: 7, price: 13.99, edition: 4, language: "japanese", cover: "https://covers.openlibrary.org/b/id/12626073-L.jpg", description: "A young Buddhist acolyte becomes obsessed with the beauty of the Golden Temple and descends into a destructive fixation." },
  { title: "Confessions of a Mask", authors: ["Yukio Mishima"], genre: "Novel", publishedYear: 1949, quantity: 9, price: 12.99, edition: 3, language: "japanese", cover: "https://covers.openlibrary.org/b/id/12626076-L.jpg", description: "A semi-autobiographical novel about a young man hiding his homosexuality behind a mask of conventional masculinity in postwar Japan." },
  { title: "The Prophet", authors: ["Kahlil Gibran"], genre: "Poetry", publishedYear: 1923, quantity: 40, price: 7.50, edition: 30, language: "arabic", cover: "https://covers.openlibrary.org/b/id/12638171-L.jpg", description: "A poetic collection of philosophical essays on love, marriage, work, and the human condition delivered by a departing sage." },
  { title: "In the Miso Soup", authors: ["Ryu Murakami"], genre: "Fiction", publishedYear: 1997, quantity: 6, price: 14.99, edition: 2, language: "japanese", cover: "https://covers.openlibrary.org/b/id/12625948-L.jpg", description: "A Tokyo nightlife guide leads an unsettling American tourist through the city's underbelly in this taut psychological thriller." },
  { title: "The Handmaid's Tale", authors: ["Margaret Atwood"], genre: "Science Fiction", publishedYear: 1985, quantity: 30, price: 13.99, edition: 5, language: "english", cover: "https://covers.openlibrary.org/b/id/12604423-L.jpg", description: "In the totalitarian Republic of Gilead, a handmaid named Offred navigates a world where women have been stripped of all rights." },
  { title: "Oryx and Crake", authors: ["Margaret Atwood"], genre: "Science Fiction", publishedYear: 2003, quantity: 11, price: 15.99, edition: 2, language: "english", cover: "https://covers.openlibrary.org/b/id/12604439-L.jpg", description: "In a post-apocalyptic world, Snowman recalls his friendship with the brilliant Crake and the catastrophic event that ended civilization." },
  { title: "The Blind Assassin", authors: ["Margaret Atwood"], genre: "Novel", publishedYear: 2000, quantity: 10, price: 16.99, edition: 2, language: "english", cover: "https://covers.openlibrary.org/b/id/12604452-L.jpg", description: "A story within a story within a story unravels a wealthy family's secrets spanning decades of passion, betrayal, and tragedy." },
  { title: "Moby-Dick", authors: ["Herman Melville"], genre: "Novel", publishedYear: 1851, quantity: 16, price: 10.99, edition: 14, language: "english", cover: "https://covers.openlibrary.org/b/id/12644939-L.jpg", description: "Captain Ahab's obsessive quest for revenge against the white whale that maimed him becomes a profound exploration of fate and madness." },
  { title: "The God of Small Things", authors: ["Arundhati Roy"], genre: "Novel", publishedYear: 1997, quantity: 20, price: 12.99, edition: 3, language: "english", cover: "https://covers.openlibrary.org/b/id/12604527-L.jpg", description: "Twin siblings in Kerala navigate family secrets, forbidden love, and the rigid hierarchies of caste in this lyrical, heartbreaking debut." },
  { title: "The Ministry of Utmost Happiness", authors: ["Arundhati Roy"], genre: "Novel", publishedYear: 2017, quantity: 9, price: 14.99, edition: 1, language: "english", cover: "https://covers.openlibrary.org/b/id/14547510-L.jpg", description: "An sprawling narrative weaves together the lives of marginalized characters across India, spanning decades of political and personal upheaval." },
  { title: "Nineteen Eighty-Four", authors: ["George Orwell"], genre: "Science Fiction", publishedYear: 1949, quantity: 40, price: 9.99, edition: 20, language: "english", cover: "https://covers.openlibrary.org/b/id/12644916-L.jpg", description: "Winston Smith rebels against the all-seeing Party in a chilling vision of totalitarianism where Big Brother watches everything." },
  { title: "Animal Farm", authors: ["George Orwell"], genre: "Satire", publishedYear: 1945, quantity: 35, price: 7.99, edition: 18, language: "english", cover: "https://covers.openlibrary.org/b/id/12644950-L.jpg", description: "A barnyard revolution descends into tyranny when the pigs take power in this timeless allegory of power and corruption." },
  { title: "Season of Migration to the North", authors: ["Tayeb Salih"], genre: "Novel", publishedYear: 1966, quantity: 12, price: 11.99, edition: 3, language: "arabic", cover: "https://covers.openlibrary.org/b/id/14635358-L.jpg", description: "A Sudanese man returns from Europe haunted by his encounters with the West, confronting the complex legacy of colonialism." },
  { title: "Fantasia: An Algerian Cavalcade", authors: ["Assia Djebar"], genre: "Novel", publishedYear: 1985, quantity: 4, price: 16.50, edition: 1, language: "french", cover: "https://covers.openlibrary.org/b/id/14634711-L.jpg", description: "A lyrical fusion of memoir and history recreates Algeria's war of independence through the voices of women who lived it." },
  { title: "The Master and Margarita", authors: ["Mikhail Bulgakov"], genre: "Novel", publishedYear: 1967, quantity: 17, price: 12.99, edition: 7, language: "russian", cover: "https://covers.openlibrary.org/b/id/12649236-L.jpg", description: "The Devil visits Stalinist Moscow with a chaotic retinue, interwoven with a retelling of Pontius Pilate's encounter with Yeshua." },
  { title: "Heart of a Dog", authors: ["Mikhail Bulgakov"], genre: "Novella", publishedYear: 1925, quantity: 8, price: 9.99, edition: 4, language: "russian", cover: "https://covers.openlibrary.org/b/id/12649240-L.jpg", description: "A scientist transforms a stray dog into a crude human being, unleashing a sharp satire of Soviet social engineering." },
  { title: "The Call of Cthulhu", authors: ["H.P. Lovecraft"], genre: "Horror", publishedYear: 1928, quantity: 10, price: 8.99, edition: 9, language: "english", cover: "https://covers.openlibrary.org/b/id/12624175-L.jpg", description: "A terrifying cosmic entity stirs in the depths of the Pacific, driving those who glimpse it to the brink of madness." },
  { title: "At the Mountains of Madness", authors: ["H.P. Lovecraft"], genre: "Horror", publishedYear: 1936, quantity: 7, price: 9.99, edition: 5, language: "english", cover: "https://covers.openlibrary.org/b/id/12624172-L.jpg", description: "An Antarctic expedition uncovers ancient alien ruins and eldritch horrors that challenge humanity's place in the universe." },
  { title: "Murder on the Orient Express", authors: ["Agatha Christie"], genre: "Mystery", publishedYear: 1934, quantity: 28, price: 9.99, edition: 12, language: "english", cover: "https://covers.openlibrary.org/b/id/12630900-L.jpg", description: "Hercule Poirot investigates a murder aboard the famous Orient Express, where every passenger has a motive and a secret." },
  { title: "And Then There Were None", authors: ["Agatha Christie"], genre: "Mystery", publishedYear: 1939, quantity: 22, price: 10.99, edition: 10, language: "english", cover: "https://covers.openlibrary.org/b/id/12630898-L.jpg", description: "Ten strangers lured to an isolated island are killed off one by one in Christie's masterpiece of suspense and misdirection." },
  { title: "Death on the Nile", authors: ["Agatha Christie"], genre: "Mystery", publishedYear: 1937, quantity: 18, price: 10.99, edition: 8, language: "english", cover: "https://covers.openlibrary.org/b/id/12630892-L.jpg", description: "Hercule Poirot's Egyptian vacation turns deadly when a beautiful heiress is murdered aboard a Nile river steamer." },
];

const userData = [
  { name: "Adam Admin", email: "admin@example.com", password: "password123" },
  { name: "Yusuf User", email: "yusuf@example.com", password: "password123" },
];

const customerData = [
  { firstName: "Fatima", lastName: "Haddad", phone: "+96171123456", address: "Hamra St 12, Beirut" },
  { firstName: "Karim", lastName: "Mansour", phone: "+96170234567", address: "Ashrafieh, Beirut" },
  { firstName: "Nour", lastName: "Khoury", phone: "+96170345678", address: "Downtown, Beirut" },
  { firstName: "Bilal", lastName: "Said", phone: "+96170456789", address: "Tripoli, North Lebanon" },
  { firstName: "Maya", lastName: "Nassar", phone: "+96170567890", address: "Jounieh, Keserwan" },
  { firstName: "Tarek", lastName: "Hassan", phone: "+96170678901", address: "Sidon, South Lebanon" },
  { firstName: "Rana", lastName: "Traboulsi", phone: "+96170789012", address: "Gemmayzeh, Beirut" },
  { firstName: "Ziad", lastName: "Fares", phone: "+96170890123", address: "Zalka, Metn" },
  { firstName: "Hala", lastName: "Daher", phone: "+96170901234", address: "Baabda, Mount Lebanon" },
  { firstName: "Samir", lastName: "Geagea", phone: "+96171012345", address: "Byblos, Keserwan" },
];

const bookRequestData = [
  { title: "The Shadow of the Wind", author: "Carlos Ruiz Zafón", notes: "Customer asked for a first edition if possible.", status: "pending" },
  { title: "The Night Circus", author: "Erin Morgenstern", notes: "Popular request, please stock multiple copies.", status: "pending" },
  { title: "Pachinko", author: "Min Jin Lee", notes: "Prefer paperback.", status: "pending" },
  { title: "A Fine Balance", author: "Rohinton Mistry", notes: "Looking for the vintage edition.", status: "pending" },
  { title: "Labyrinths", author: "Jorge Luis Borges", notes: "Collector's edition requested.", status: "pending" },
  { title: "The Overstory", author: "Richard Powers", notes: "Heard good things, please acquire.", status: "pending" },
  { title: "Circe", author: "Madeline Miller", notes: "", status: "pending" },
  { title: "The Name of the Rose", author: "Umberto Eco", notes: "Ordered from supplier.", status: "acquired" },
  { title: "The Sailor Who Fell from Grace with the Sea", author: "Yukio Mishima", notes: "Any edition is fine.", status: "acquired" },
  { title: "The Humans", author: "Matt Haig", notes: "Acquired in hardcover.", status: "acquired" },
  { title: "The Shadow Lines", author: "Amitav Ghosh", notes: "Out of print, cannot source.", status: "rejected" },
  { title: "The Satanic Verses", author: "Salman Rushdie", notes: "Cannot be stocked per policy.", status: "rejected" },
  { title: "The Da Vinci Code", author: "Dan Brown", notes: "Low demand, rejected.", status: "rejected" },
];

const bookCommentData: { title: string; name: string; comment: string; rating: number }[] = [
  { title: "One Hundred Years of Solitude", name: "Rana", comment: "A mesmerizing masterpiece. I lost myself in Macondo.", rating: 5 },
  { title: "One Hundred Years of Solitude", name: "Tarek", comment: "Dense but worth every page.", rating: 4 },
  { title: "Kafka on the Shore", name: "Maya", comment: "Surreal and haunting, Murakami at his best.", rating: 5 },
  { title: "Norwegian Wood", name: "Bilal", comment: "Beautifully melancholic.", rating: 4 },
  { title: "The Left Hand of Darkness", name: "Nour", comment: "A landmark of science fiction and gender.", rating: 5 },
  { title: "Beloved", name: "Hala", comment: "Devastating and essential reading.", rating: 5 },
  { title: "Crime and Punishment", name: "Ziad", comment: "Psychologically gripping from start to finish.", rating: 4 },
  { title: "The Metamorphosis", name: "Samir", comment: "Short but unforgettable.", rating: 5 },
  { title: "The Stranger", name: "Fatima", comment: "The absurdity of existence never felt so crisp.", rating: 4 },
  { title: "Pride and Prejudice", name: "Karim", comment: "Timeless. Elizabeth Bennet is iconic.", rating: 5 },
  { title: "Nineteen Eighty-Four", name: "Layla", comment: "Terrifyingly relevant today.", rating: 5 },
  { title: "Murder on the Orient Express", name: "Omar", comment: "The twist still surprises me.", rating: 4 },
  { title: "The Handmaid's Tale", name: "Rana", comment: "Chilling and powerful.", rating: 5 },
  { title: "War and Peace", name: "Nour", comment: "A commitment, but a rewarding one.", rating: 4 },
  { title: "The Master and Margarita", name: "Tarek", comment: "Wild, funny, and profound.", rating: 5 },
];

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB");

  await Author.deleteMany({});
  await Book.deleteMany({});
  await User.deleteMany({});
  await Customer.deleteMany({});
  await Order.deleteMany({});
  await BookRequest.deleteMany({});
  await BookComment.deleteMany({});
  console.log("Cleared existing collections");

  const authors = await Author.insertMany(authorData);
  console.log(`Inserted ${authors.length} authors`);

  const nameToId = Object.fromEntries(authors.map((a) => [a.name, a._id]));

  const books = bookData.map((b) => ({
    title: b.title,
    authors: b.authors.map((name) => nameToId[name]).filter(Boolean),
    cover: b.cover,
    genre: b.genre,
    publishedYear: b.publishedYear,
    quantity: b.quantity,
    price: b.price,
    edition: b.edition,
    language: b.language,
    description: b.description,
    avgRating: 4,
    ratingCount: 1,
    isbn: `978-${String(b.publishedYear).padStart(4, "0")}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
  }));

  const insertedBooks = await Book.insertMany(books);
  console.log(`Inserted ${insertedBooks.length} books`);

  const titleToId = Object.fromEntries(insertedBooks.map((b) => [b.title, b._id]));

  const hashedUsers = await Promise.all(
    userData.map(async (u) => ({
      name: u.name,
      email: u.email,
      password: await bcrypt.hash(u.password, 10),
    })),
  );
  const users = await User.insertMany(hashedUsers);
  console.log(`Inserted ${users.length} users`);

  const customers = await Customer.insertMany(customerData);
  console.log(`Inserted ${customers.length} customers`);

  const orderSeeds = [
    { customerIdx: 0, bookIdx: [0, 47], status: "pending", delivery: "home" },
    { customerIdx: 1, bookIdx: [7, 71], status: "pending", delivery: "bureau" },
    { customerIdx: 2, bookIdx: [13, 26], status: "pending", delivery: "home" },
    { customerIdx: 3, bookIdx: [31, 32], status: "pending", delivery: "home" },
    { customerIdx: 4, bookIdx: [43, 44, 60], status: "sold", delivery: "bureau" },
    { customerIdx: 5, bookIdx: [52], status: "sold", delivery: "home" },
    { customerIdx: 6, bookIdx: [64, 65], status: "sold", delivery: "bureau" },
    { customerIdx: 7, bookIdx: [76, 77], status: "delivered", delivery: "home" },
    { customerIdx: 8, bookIdx: [1, 2], status: "delivered", delivery: "bureau" },
    { customerIdx: 9, bookIdx: [18, 19], status: "delivered", delivery: "home" },
    { customerIdx: 0, bookIdx: [33], status: "canceled", delivery: "home" },
    { customerIdx: 3, bookIdx: [55, 56], status: "canceled", delivery: "bureau" },
    { customerIdx: 6, bookIdx: [78, 79], status: "canceled", delivery: "home" },
  ];

  const orders = orderSeeds.map((o) => ({
    customer: customers[o.customerIdx]._id,
    items: o.bookIdx.map((idx) => ({
      book: insertedBooks[idx]._id,
      quantity: 1 + (idx % 2),
    })),
    status: o.status,
    delivery: o.delivery,
  }));
  const insertedOrders = await Order.insertMany(orders);
  console.log(`Inserted ${insertedOrders.length} orders`);

  const bookRequests = await BookRequest.insertMany(bookRequestData);
  console.log(`Inserted ${bookRequests.length} book requests`);

  const bookComments = bookCommentData.map((c) => ({
    bookId: titleToId[c.title],
    name: c.name,
    comment: c.comment,
    rating: c.rating,
  }));
  const insertedComments = await BookComment.insertMany(bookComments);
  console.log(`Inserted ${insertedComments.length} book comments`);

  await mongoose.disconnect();
  console.log("Done");
}

seed().catch((e) => {
  console.error("Seed failed:", e);
  process.exit(1);
});
