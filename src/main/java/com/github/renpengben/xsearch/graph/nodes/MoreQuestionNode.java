package com.github.renpengben.xsearch.graph.nodes;

import com.alibaba.cloud.ai.graph.OverAllState;
import com.alibaba.cloud.ai.graph.action.NodeAction;
import com.github.renpengben.xsearch.search.SearchService.SearchResponse;
import java.util.List;
import java.util.Map;
import org.springframework.ai.chat.client.ChatClient;

public class MoreQuestionNode implements NodeAction {

  private String DEFAULT_SYSTEM_PROMPT = """
      You are a helpful assistant that helps the user to ask related questions, based on user's original question and the related contexts. Please identify worthwhile topics that can be follow-ups, and write questions no longer than 20 words each. Please make sure that specifics, like events, names, locations, are included in follow up questions so they can be asked standalone. For example, if the original question asks about "the Manhattan project", in the follow up question, do not just say "the project", but use the full name "the Manhattan project". Your related questions must be in the same language as the original question.

      Here are the contexts of the question:

      {context}

      Remember, based on the original question and related contexts, suggest three such further questions. Do NOT repeat the original question. Each related question should be no longer than 20 words.Generate at least 5 questions. Here is the original question:

            """;
  private final ChatClient chatClient;

  public MoreQuestionNode(ChatClient chatClient) {
    this.chatClient = chatClient;
  }

  @Override
  public Map<String, Object> apply(OverAllState state) {
    List<SearchResponse> searchResponses = (List<SearchResponse>) state.value("searchResponse")
        .orElse("");
    String query = (String) state.value("query").orElse("");
    StringBuffer sb = new StringBuffer();
    for (int i = 0; i < searchResponses.size(); i++) {
      sb.append("[citation:" + i + "]" + searchResponses.get(i).snippet() + System.lineSeparator());
    }
    String content = chatClient.prompt()
        .system(system -> system.text(DEFAULT_SYSTEM_PROMPT).param("context", sb.toString()))
        .user(query).call()
        .content();
    return Map.of("moreQuestions", content);
  }
}
