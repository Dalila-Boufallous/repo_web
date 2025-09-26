import org.springframework.web.bind.annotation.*;
import java.io.*;
import java.util.*;
import com.fasterxml.jackson.databind.ObjectMapper;

@RestController
public class NLPController {

    @PostMapping("/nlp/extract")
    public Map<String, Object> extract(@RequestBody Map<String, String> body) throws IOException {
        String noteText = body.get("text");

        // Commande pour exécuter le script Python
        List<String> command = Arrays.asList(
            "python", 
            "C:\\Users\\dalil\\edsnlp_service\\nlp_pipeline.py", 
            noteText
        );

        ProcessBuilder pb = new ProcessBuilder(command);
        Process process = pb.start();

        // Lire la sortie du script
        BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
        String line;
        StringBuilder output = new StringBuilder();
        while ((line = reader.readLine()) != null) {
            output.append(line);
        }

        // Convertir JSON en Map
        ObjectMapper mapper = new ObjectMapper();
        Map<String, Object> result = mapper.readValue(output.toString(), Map.class);

        // Ici tu peux stocker `result` en base de données
        return result;  // Retour à Angular
    }
}
