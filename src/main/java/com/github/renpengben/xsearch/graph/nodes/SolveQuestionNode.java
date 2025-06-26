package com.github.renpengben.xsearch.graph.nodes;

import com.alibaba.cloud.ai.graph.OverAllState;
import com.alibaba.cloud.ai.graph.action.NodeAction;
import com.github.renpengben.xsearch.search.SearchService.SearchResponse;
import java.util.List;
import java.util.Map;
import org.springframework.ai.chat.client.ChatClient;

public class SolveQuestionNode implements NodeAction {

  private String DEFAULT_SYSTEM_PROMPT = """
      You are a large language AI assistant built by X Search. You are given a user question, and please write clean, concise and accurate answer to the question. You will be given a set of related contexts to the question, each starting with a reference number like [[citation:x]], where x is a number. Please use the context and cite the context at the end of each sentence if applicable.

      Your answer must be correct, accurate and written by an expert using an unbiased and professional tone. Please limit to 1024 tokens. Do not give any information that is not related to the question, and do not repeat. Say "information is missing on" followed by the related topic, if the given context do not provide sufficient information.

      Please cite the contexts with the reference numbers, in the format [citation:x]. If a sentence comes from multiple contexts, please list all applicable citations, like [citation:3][citation:5]. Other than code and specific names and citations, your answer must be written in the same language as the question.

      Here are the set of contexts:

      {context}

      Remember, don't blindly repeat the contexts verbatim. And here is the user question:
      """;
  private final ChatClient chatClient;

  public SolveQuestionNode(ChatClient chatClient) {
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
    return Map.of("result", content);
  }
}
